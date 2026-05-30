"""
ingest.py – Multi-Subject Notes App
Data ingestion pipeline powered by LangChain:
  1. Fetch / read source documents
  2. Chunk into token-approximate windows with overlap using RecursiveCharacterTextSplitter
  3. Embed with local HuggingFaceEmbeddings (all-MiniLM-L6-v2, dim=384)
  4. Upsert into isolated Chroma collections with cosine similarity
"""

import argparse
import logging
from typing import List, Dict, Any

import requests
from bs4 import BeautifulSoup
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

from src.core.config import (
    CHROMA_PERSIST_DIR,
    EMBED_MODEL,
    CHUNK_SIZE,
    CHUNK_OVERLAP,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def fetch_url_content(url: str, timeout: int = 10) -> str:
    """Fetch and clean text content from a URL."""
    try:
        headers = {"User-Agent": "Mozilla/5.0 (compatible; MyRAGBot/1.0)"}
        resp = requests.get(url, headers=headers, timeout=timeout)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
        # Remove nav, footer, script, style
        for tag in soup(["nav", "footer", "script", "style", "header", "aside"]):
            tag.decompose()
        return soup.get_text(separator="\n", strip=True)
    except Exception as e:
        logger.warning(f"Could not fetch {url}: {e}")
        return ""


def ingest_documents(index_name: str, docs: List[Dict[str, str]], links: List[str], reset: bool = False) -> int:
    """
    Main ingestion pipeline using LangChain.
    docs: list of dicts with {"title": str, "content": str}
    links: list of URLs to scrape
    Returns number of vectors upserted.
    """
    from langchain_huggingface import HuggingFaceEmbeddings
    from langchain_chroma import Chroma

    # 1. Load embedding model
    logger.info(f"Loading HuggingFace embedding model: {EMBED_MODEL}")
    embeddings = HuggingFaceEmbeddings(
        model_name=EMBED_MODEL,
        model_kwargs={"device": "mps"} if __import__('torch').backends.mps.is_available() else {"device": "cpu"}
    )

    # 2. Connect to Chroma DB
    logger.info(f"Connecting to Chroma collection '{index_name}'...")
    db = Chroma(
        collection_name=index_name,
        embedding_function=embeddings,
        persist_directory=CHROMA_PERSIST_DIR,
        collection_metadata={"hnsw:space": "cosine"}
    )

    # 3. Clean up database if resetting
    if reset:
        try:
            logger.info(f"Resetting existing collection '{index_name}'...")
            db.delete_collection()
            # Re-initialize empty collection
            db = Chroma(
                collection_name=index_name,
                embedding_function=embeddings,
                persist_directory=CHROMA_PERSIST_DIR,
                collection_metadata={"hnsw:space": "cosine"}
            )
        except Exception as e:
            logger.warning(f"Error resetting collection: {e}")

    # 4. Process documents
    processed_docs = []

    for d in docs:
        if d.get("content"):
            processed_docs.append({
                "title": d.get("title", "Uploaded Document"),
                "url": d.get("title", "Uploaded Document"),
                "category": "uploaded",
                "content": d["content"].strip()
            })

    # Process links
    for url in links:
        logger.info(f"Fetching live content from: {url}")
        content = fetch_url_content(url)
        if content and len(content) > 200:
            processed_docs.append({
                "title": f"Live: {url}",
                "url": url,
                "category": "web",
                "content": content[:8000],  # cap to avoid very long pages
            })

    if not processed_docs:
        logger.info("No documents or links to process.")
        return 0

    # 5. Split documents into chunks using LangChain
    # 200 words approx = 1000 characters
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE * 5,
        chunk_overlap=CHUNK_OVERLAP * 5,
        length_function=len,
    )

    langchain_docs = []
    for doc in processed_docs:
        chunks = splitter.split_text(doc["content"])
        logger.info(f"  '{doc['title']}' → {len(chunks)} chunks")
        for i, chunk in enumerate(chunks):
            langchain_docs.append(Document(
                page_content=chunk,
                metadata={
                    "title": doc["title"],
                    "url": doc["url"],
                    "category": doc["category"],
                    "chunk_index": i,
                    "chunk_text": chunk[:500],  # partial text preview for compatibility
                }
            ))

    if not langchain_docs:
        logger.info("No vectors generated.")
        return 0

    # 6. Add documents to ChromaDB
    logger.info(f"Upserting {len(langchain_docs)} chunks into Chroma collection...")
    db.add_documents(langchain_docs)

    logger.info(f"✅ Ingestion complete! {len(langchain_docs)} documents indexed in collection '{index_name}'.")
    return len(langchain_docs)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Multi-Subject Notes Ingestion Pipeline")
    parser.add_argument("--subject", type=str, required=True, help="Subject name to ingest into")
    parser.add_argument("--reset", action="store_true", help="Reset the collection before ingesting")
    parser.add_argument("--links", type=str, nargs="+", help="Space-separated list of URLs to ingest")

    args = parser.parse_args()

    links = args.links if args.links else []

    logger.info(f"Starting CLI ingestion for subject '{args.subject}'...")

    from src.core.database import create_or_get_subject, get_subject_index_name

    create_or_get_subject(args.subject)
    index_name = get_subject_index_name(args.subject)

    if not index_name:
        logger.error(f"Could not find index name for subject '{args.subject}'")
        exit(1)

    ingest_documents(index_name=index_name, docs=[], links=links, reset=args.reset)
