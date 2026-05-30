import io
import logging
import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from langchain_chroma import Chroma
import PyPDF2

from src.core.config import CHROMA_PERSIST_DIR
from src.rag.rag_chain import RAGChain
from src.core.database import load_subjects, create_or_get_subject, save_subjects
from src.rag.ingest import ingest_documents
from src.core.auth import get_current_user
from src.api.schemas import CreateSubjectRequest, QueryRequest

# Setup Logging
logger = logging.getLogger(__name__)

# APIRouter instance
router = APIRouter(prefix="/api")

# Global Cached Embeddings & RAG Chain
_embeddings = None
_rag_chain = None

def get_embeddings():
    global _embeddings
    if _embeddings is None:
        logger.info("Initializing HuggingFace embedding model...")
        from langchain_huggingface import HuggingFaceEmbeddings
        from src.core.config import EMBED_MODEL
        import torch
        device = "mps" if torch.backends.mps.is_available() else "cpu"
        _embeddings = HuggingFaceEmbeddings(
            model_name=EMBED_MODEL,
            model_kwargs={"device": device}
        )
    return _embeddings

def _get_rag_chain() -> RAGChain:
    global _rag_chain
    if _rag_chain is None:
        logger.info("Initializing RAG chain...")
        _rag_chain = RAGChain(use_reranker=True)
    return _rag_chain

# Helper: format ISO dates to "Month Day, Year"
def format_date(iso_str: str) -> str:
    try:
        dt = datetime.datetime.fromisoformat(iso_str)
        return dt.strftime("%b %d, %Y")
    except Exception:
        return "Recent"

# Helper: Retrieve list of documents inside a collection dynamically
def get_subject_docs(index_name: str) -> List[Dict[str, str]]:
    try:
        db = Chroma(
            collection_name=index_name,
            embedding_function=get_embeddings(),
            persist_directory=CHROMA_PERSIST_DIR,
        )
        data = db.get(include=["metadatas"])
        metadatas = data.get("metadatas", [])
        seen = set()
        docs = []
        for meta in metadatas:
            if not meta:
                continue
            title = meta.get("title")
            if title and title not in seen:
                seen.add(title)
                # Map to format the frontend expects
                docs.append({
                    "id": title,
                    "name": title,
                })
        return docs
    except Exception as e:
        logger.error(f"Error fetching documents for subject collection '{index_name}': {e}")
        return []

# --- API Routes ---

@router.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.datetime.now().isoformat()}

@router.get("/auth/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return {"user": current_user}

@router.get("/subjects")
def get_subjects(current_user: dict = Depends(get_current_user)):
    subjects = load_subjects()
    formatted = []
    for display_name, info in subjects.items():
        index_name = info["index_name"]
        docs = get_subject_docs(index_name)
        formatted.append({
            "id": index_name,
            "name": display_name,
            "docCount": len(docs),
            "lastUpdated": format_date(info.get("created_at")),
            "documents": docs
        })
    return formatted

@router.post("/subjects")
def create_subject_endpoint(request: CreateSubjectRequest, current_user: dict = Depends(get_current_user)):
    name = request.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Subject name cannot be empty")
    
    subjects = load_subjects()
    if name in subjects:
        raise HTTPException(status_code=400, detail="Subject already exists")
        
    index_name = create_or_get_subject(name)
    subjects = load_subjects()
    info = subjects[name]
    
    return {
        "id": index_name,
        "name": name,
        "docCount": 0,
        "lastUpdated": format_date(info.get("created_at")),
        "documents": []
    }

@router.delete("/subjects/{subject_id}")
def delete_subject_endpoint(subject_id: str, current_user: dict = Depends(get_current_user)):
    subjects = load_subjects()
    target_display_name = None
    for name, info in list(subjects.items()):
        if info.get("index_name") == subject_id:
            target_display_name = name
            break
            
    if not target_display_name:
        raise HTTPException(status_code=404, detail="Subject not found")
        
    # Delete the Chroma collection
    try:
        db = Chroma(
            collection_name=subject_id,
            embedding_function=get_embeddings(),
            persist_directory=CHROMA_PERSIST_DIR,
        )
        db.delete_collection()
    except Exception as e:
        logger.warning(f"Could not delete Chroma collection for subject '{subject_id}': {e}")
        
    # Remove from subjects.json
    del subjects[target_display_name]
    save_subjects(subjects)
    
    return {"success": True}

@router.delete("/subjects/{subject_id}/documents/{doc_id}")
def delete_document_endpoint(subject_id: str, doc_id: str, current_user: dict = Depends(get_current_user)):
    subjects = load_subjects()
    display_name = None
    for name, info in subjects.items():
        if info.get("index_name") == subject_id:
            display_name = name
            break
            
    if not display_name:
        raise HTTPException(status_code=404, detail="Subject not found")
        
    try:
        db = Chroma(
            collection_name=subject_id,
            embedding_function=get_embeddings(),
            persist_directory=CHROMA_PERSIST_DIR,
        )
        # Find matching chunk IDs
        data = db.get(where={"title": doc_id})
        ids_to_delete = data.get("ids", [])
        if ids_to_delete:
            db.delete(ids=ids_to_delete)
            
        # Update docs_count in subjects.json
        actual_docs = get_subject_docs(subject_id)
        subjects[display_name]["docs_count"] = len(actual_docs)
        save_subjects(subjects)
        
        return {"success": True}
    except Exception as e:
        logger.exception("Failed to delete document")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ingest")
async def ingest_endpoint(
    subject_id: str = Form(...),
    files: List[UploadFile] = File(default=[]),
    urls: Optional[str] = Form(None),
    reset: bool = Form(False),
    current_user: dict = Depends(get_current_user)
):
    subjects = load_subjects()
    display_name = None
    for name, info in subjects.items():
        if info.get("index_name") == subject_id:
            display_name = name
            break
            
    if not display_name:
        raise HTTPException(status_code=404, detail="Subject not found")
        
    docs = []
    for f in files:
        content = ""
        filename = f.filename
        try:
            file_bytes = await f.read()
            if filename.lower().endswith('.pdf'):
                pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
                for page in pdf_reader.pages:
                    text = page.extract_text()
                    if text:
                        content += text + "\n"
            else:
                content = file_bytes.decode("utf-8", errors="ignore")
                
            if content.strip():
                docs.append({"title": filename, "content": content})
        except Exception as e:
            logger.error(f"Error parsing file '{filename}': {e}")
            
    links = [l.strip() for l in (urls or "").split("\n") if l.strip()]
    
    if not docs and not links and not reset:
        raise HTTPException(status_code=400, detail="No documents or links provided")
        
    try:
        count = ingest_documents(index_name=subject_id, docs=docs, links=links, reset=reset)
        
        # Update docs_count in subjects.json
        actual_docs = get_subject_docs(subject_id)
        subjects[display_name]["docs_count"] = len(actual_docs)
        save_subjects(subjects)
        
        return {
            "success": True, 
            "message": f"Successfully ingested context. {count} chunks index.",
            "docCount": len(actual_docs),
            "documents": actual_docs
        }
    except Exception as e:
        logger.exception("Ingest failed")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/query")
def query_endpoint(request: QueryRequest, current_user: dict = Depends(get_current_user)):
    subjects = load_subjects()
    display_name = None
    for name, info in subjects.items():
        if info.get("index_name") == request.subject_id:
            display_name = name
            break
            
    if not display_name:
        raise HTTPException(status_code=404, detail="Subject not found")
        
    try:
        chain = _get_rag_chain()
        chain.retriever.use_reranker = request.use_reranker
        
        cat = request.category_filter if request.category_filter and request.category_filter != "All" else None
        
        response = chain.run(
            index_name=request.subject_id,
            question=request.question.strip(),
            top_k=request.top_k or 5,
            category_filter=cat,
            compute_metrics=True,
        )
        
        # Format sources
        formatted_sources = []
        for i, s in enumerate(response.sources):
            formatted_sources.append({
                "id": f"s-{i}",
                "name": s.get("title", "Unknown"),
                "url": s.get("url") or "#",
                "category": s.get("category", ""),
                "score": s.get("score", 0.0)
            })
            
        return {
            "answer": response.answer,
            "sources": formatted_sources,
            "metrics": {
                "faithfulness": response.faithfulness,
                "relevancy": response.answer_relevancy,
                "latency": response.latency_seconds
            },
            "chunks": [c.get("text", "") for c in response.chunks]
        }
    except Exception as e:
        logger.exception("Query failed")
        raise HTTPException(status_code=500, detail=str(e))
