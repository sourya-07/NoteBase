from typing import Optional
from pydantic import BaseModel

class CreateSubjectRequest(BaseModel):
    name: str

class QueryRequest(BaseModel):
    subject_id: str
    question: str
    top_k: Optional[int] = 5
    category_filter: Optional[str] = None
    use_reranker: Optional[bool] = True
