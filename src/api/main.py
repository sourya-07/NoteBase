import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.core.config import DEBUG, APP_HOST
from src.core.database import init_db
from src.api.routes import router, get_embeddings

# Setup Logging
logging.basicConfig(
    level=logging.DEBUG if DEBUG else logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize the database schema
    init_db()
    # Pre-load the embedding model so the first request doesn't time out
    logger.info("Pre-loading embedding model at startup...")
    try:
        get_embeddings()
        logger.info("Embedding model loaded successfully.")
    except Exception as e:
        logger.warning(f"Failed to pre-load embedding model: {e}")
    yield

app = FastAPI(title="NoteBase RAG API", lifespan=lifespan)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the endpoints router
app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.api.main:app", host=APP_HOST, port=8000, reload=DEBUG)
