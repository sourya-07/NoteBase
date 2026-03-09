"""
rag_chain.py – Multi-Subject Notes RAG
RAG chain: retrieves context from ChromaDB, prompts the LLM via LangChain LCEL, returns answer + sources.
Supports OpenAI, Groq, and Ollama (local) chat models.
Evaluation metrics computed locally offline without external API dependencies.
"""

import logging
import time
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional

from sentence_transformers import SentenceTransformer
import numpy as np

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from src.rag.retriever import ChromaRetriever
from src.core.config import (
    EMBED_MODEL,
    LLM_PROVIDER,
    OPENAI_API_KEY,
    OPENAI_MODEL,
    GROQ_API_KEY,
    GROQ_MODEL,
    OLLAMA_BASE_URL,
    OLLAMA_MODEL,
    LLM_MAX_TOKENS,
    LLM_TEMPERATURE,
    TOP_K,
)

logger = logging.getLogger(__name__)

RAG_SYSTEM_PROMPT = r"""You are an expert knowledge assistant.
Your knowledge comes strictly from the provided context.

INSTRUCTIONS:
- Answer ONLY using the provided context below.
- Always cite your sources using inline Markdown links to the provided URL, e.g. [[Source N]](URL).
- If the context does not contain sufficient information to answer, say so explicitly — do not hallucinate.
- Be concise but comprehensive. Use bullet points where helpful.
- For technical topics, include code examples if they appear in the context.

CONTEXT:
{context}
"""

RAG_USER_TEMPLATE = """Question: {question}

Please provide a clear, well-structured answer with citations."""


# ── LLM Initialisation ────────────────────────────────────────────────────────

def _get_llm():
    """Build and return a LangChain Chat Model based on configuration."""
    provider = LLM_PROVIDER.lower()
    if provider == "openai":
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            api_key=OPENAI_API_KEY,
            model=OPENAI_MODEL,
            max_tokens=LLM_MAX_TOKENS,
            temperature=LLM_TEMPERATURE,
        )
    elif provider == "groq":
        from langchain_groq import ChatGroq
        return ChatGroq(
            api_key=GROQ_API_KEY,
            model=GROQ_MODEL,
            max_tokens=LLM_MAX_TOKENS,
            temperature=LLM_TEMPERATURE,
        )
    elif provider == "ollama":
        from langchain_community.chat_models import ChatOllama
        return ChatOllama(
            base_url=OLLAMA_BASE_URL,
            model=OLLAMA_MODEL,
            temperature=LLM_TEMPERATURE,
        )
    else:
        raise ValueError(f"Unknown LLM_PROVIDER='{LLM_PROVIDER}'. Set to 'openai', 'groq', or 'ollama'.")


# ── Evaluation Metrics ────────────────────────────────────────────────────────

class _MetricComputer:
    """Lazy-loaded singleton for metric computation."""
    _instance: Optional["_MetricComputer"] = None
    _embedder: Optional[SentenceTransformer] = None

    @classmethod
    def get(cls) -> SentenceTransformer:
        if cls._embedder is None:
            cls._embedder = SentenceTransformer(EMBED_MODEL)
        return cls._embedder


def compute_faithfulness(answer: str, context: str) -> float:
    """
    Approximate faithfulness: cosine similarity between answer embedding
    and context embedding. Range [0, 1]. Higher = more grounded.
    """
    if not answer or not context:
        return 0.0
    embedder = _MetricComputer.get()
    embs = embedder.encode([answer, context], normalize_embeddings=True)
    score = float(np.dot(embs[0], embs[1]))
    return max(0.0, min(1.0, score))


def compute_answer_relevancy(question: str, answer: str) -> float:
    """
    Approximate answer relevancy: cosine similarity between question embedding
    and answer embedding. Range [0, 1]. Higher = more relevant.
    """
    if not question or not answer:
        return 0.0
    embedder = _MetricComputer.get()
    embs = embedder.encode([question, answer], normalize_embeddings=True)
    score = float(np.dot(embs[0], embs[1]))
    return max(0.0, min(1.0, score))


# ── Main RAG Chain ────────────────────────────────────────────────────────────

@dataclass
class RAGResponse:
    question: str
    answer: str
    sources: List[Dict[str, Any]]
    context: str
    faithfulness: float
    answer_relevancy: float
    latency_seconds: float
    chunks: List[Dict[str, Any]] = field(default_factory=list)


class RAGChain:
    """
    Full RAG pipeline:
      query → ChromaDB retrieval → (optional rerank) → LLM prompt via LCEL → grounded answer
    """

    def __init__(self, use_reranker: bool = True):
        self.retriever = ChromaRetriever(use_reranker=use_reranker)

    def run(
        self,
        index_name: str,
        question: str,
        top_k: int = TOP_K,
        category_filter: Optional[str] = None,
        compute_metrics: bool = True,
    ) -> RAGResponse:
        """
        Execute the full RAG chain for a user question against a specific index.
        Returns a RAGResponse dataclass.
        """
        t0 = time.time()

        # 1. Retrieve context from ChromaDB
        retrieval = self.retriever.retrieve_with_sources(
            index_name=index_name, query=question, top_k=top_k, category_filter=category_filter
        )
        context = retrieval["context"]
        sources = retrieval["sources"]
        chunks = retrieval["chunks"]

        if not context.strip():
            return RAGResponse(
                question=question,
                answer=(
                    "I could not find relevant information in the knowledge base. "
                    "Please make sure documents have been ingested first."
                ),
                sources=[],
                context="",
                faithfulness=0.0,
                answer_relevancy=0.0,
                latency_seconds=time.time() - t0,
                chunks=[],
            )

        # 2. Build prompts & execute LangChain LCEL Chain
        try:
            prompt = ChatPromptTemplate.from_messages([
                ("system", RAG_SYSTEM_PROMPT),
                ("human", RAG_USER_TEMPLATE),
            ])
            llm = _get_llm()
            
            # Simple LCEL Chain
            chain = prompt | llm | StrOutputParser()
            
            answer = chain.invoke({
                "context": context,
                "question": question
            })
        except Exception as e:
            logger.error(f"LangChain QA execution error: {e}")
            answer = f"[LLM Error] {e}"

        latency = time.time() - t0

        # 3. Compute evaluation metrics
        faithfulness = 0.0
        answer_relevancy = 0.0
        if compute_metrics and answer and not answer.startswith("[LLM Error]"):
            try:
                faithfulness = compute_faithfulness(answer, context)
                answer_relevancy = compute_answer_relevancy(question, answer)
            except Exception as e:
                logger.warning(f"Metric computation failed: {e}")

        return RAGResponse(
            question=question,
            answer=answer,
            sources=sources,
            context=context,
            faithfulness=faithfulness,
            answer_relevancy=answer_relevancy,
            latency_seconds=latency,
            chunks=chunks,
        )

    def run_batch(self, index_name: str, questions: List[str]) -> List[RAGResponse]:
        """Run multiple questions and return all responses."""
        return [self.run(index_name=index_name, question=q) for q in questions]
