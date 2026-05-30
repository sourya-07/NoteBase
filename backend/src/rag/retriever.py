"""
retriever.py – Multi-Subject Notes App
Retrieval layer: queries ChromaDB via LangChain, optionally reranks results.
"""

import logging
import os
from typing import List, Dict, Any, Optional

IS_RENDER = os.environ.get("RENDER", False)

from src.core.config import (
    CHROMA_PERSIST_DIR,
    EMBED_MODEL,
    TOP_K,
    RERANK_TOP_N,
)

logger = logging.getLogger(__name__)


class ChromaRetriever:
    """
    Retrieves relevant document chunks from ChromaDB using LangChain vector search.
    Optionally reranks results with a cross-encoder for higher precision.
    """

    def __init__(self, use_reranker: bool = True):
        from langchain_huggingface import HuggingFaceEmbeddings
        logger.info(f"Loading HuggingFace embedding model: {EMBED_MODEL}")
        self.embeddings = HuggingFaceEmbeddings(
            model_name=EMBED_MODEL,
            model_kwargs={"device": "mps"} if __import__('torch').backends.mps.is_available() else {"device": "cpu"}
        )

        # Cross-encoder reranker (small, fast, free)
        # Automatically disable the heavy cross-encoder reranker on Render's 512MB RAM free tier to avoid OOM crashes
        self.use_reranker = use_reranker if not IS_RENDER else False
        
        if self.use_reranker:
            logger.info("Loading cross-encoder reranker: cross-encoder/ms-marco-MiniLM-L-6-v2")
            try:
                from sentence_transformers import CrossEncoder
                self.reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
            except Exception as e:
                logger.warning(f"Could not load reranker: {e}. Disabling reranking.")
                self.use_reranker = False
                self.reranker = None
        else:
            if IS_RENDER:
                logger.info("Reranker disabled in Render environment to conserve memory.")
            self.reranker = None

    def retrieve(
        self,
        index_name: str,
        query: str,
        top_k: int = TOP_K,
        category_filter: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Retrieve top-k semantically similar chunks for `query` from the specified collection.
        Optionally filter by category.
        Returns a list of dicts with keys: id, score, title, url, category, text.
        """
        try:
            from langchain_chroma import Chroma
            db = Chroma(
                collection_name=index_name,
                embedding_function=self.embeddings,
                persist_directory=CHROMA_PERSIST_DIR,
            )
        except Exception as e:
            logger.error(f"ChromaDB collection '{index_name}' not found: {e}")
            return []

        # Build metadata filter
        filter_dict = None
        if category_filter:
            filter_dict = {"category": category_filter}

        # Query ChromaDB using LangChain
        try:
            # similarity_search_with_score returns a list of (Document, float_distance)
            results = db.similarity_search_with_score(
                query=query,
                k=top_k,
                filter=filter_dict
            )
        except Exception as e:
            logger.error(f"ChromaDB query error: {e}")
            return []

        if not results:
            return []

        # Normalise result format
        candidates = []
        for doc, distance in results:
            # ChromaDB cosine distance: score = 1 - distance (higher = more similar)
            score = 1.0 - float(distance)
            meta = doc.metadata
            candidates.append(
                {
                    "id": doc.id or f"doc-{hash(doc.page_content)}",
                    "score": score,
                    "title": meta.get("title", "Unknown"),
                    "url": meta.get("url", ""),
                    "category": meta.get("category", "general"),
                    "chunk_index": meta.get("chunk_index", 0),
                    "text": doc.page_content,
                }
            )

        # Optional reranking
        if self.use_reranker and self.reranker and len(candidates) > 1:
            pairs = [(query, c["text"]) for c in candidates]
            rerank_scores = self.reranker.predict(pairs)
            for c, s in zip(candidates, rerank_scores):
                c["rerank_score"] = float(s)
            candidates.sort(key=lambda x: x["rerank_score"], reverse=True)

        return candidates[:RERANK_TOP_N]

    def retrieve_with_sources(
        self,
        index_name: str,
        query: str,
        top_k: int = TOP_K,
        category_filter: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Retrieve and format context + sources for use in the RAG prompt.
        Returns: {"context": str, "sources": list[dict]}
        """
        chunks = self.retrieve(index_name=index_name, query=query, top_k=top_k, category_filter=category_filter)

        context_parts = []
        sources = []
        seen_urls = set()

        for i, chunk in enumerate(chunks, 1):
            context_parts.append(
                f"[Source {i}: {chunk['title']}] (URL: {chunk['url']})\n{chunk['text']}\n"
            )
            url = chunk["url"]
            if url not in seen_urls:
                sources.append(
                    {
                        "title": chunk["title"],
                        "url": url,
                        "category": chunk["category"],
                        "score": chunk.get("rerank_score", chunk["score"]),
                    }
                )
                seen_urls.add(url)

        return {
            "context": "\n---\n".join(context_parts),
            "sources": sources,
            "chunks": chunks,
        }
