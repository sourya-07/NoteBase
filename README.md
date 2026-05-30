# 📒 NoteBase

> **Your personal AI knowledge base** — upload documents, paste URLs, and ask natural-language questions. Each subject gets its own isolated, persistent vector collection, powered by [ChromaDB](https://github.com/chroma-core/chroma) embedded vector database.

[![Python 3.11+](https://img.shields.io/badge/Python-3.11+-3776ab.svg)](https://python.org)
[![ChromaDB](https://img.shields.io/badge/Vector%20DB-ChromaDB-blue.svg)](https://github.com/chroma-core/chroma)
[![FastAPI](https://img.shields.io/badge/API-FastAPI-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61dafb.svg)](https://react.dev)
[![Gradio](https://img.shields.io/badge/Playground-Gradio-f97316.svg)](https://gradio.app)

---

## 🤔 What Does This App Do?

Think of it as **ChatGPT for your own documents** with robust production-ready layers:

1. **Secure Session Auth**: Integrated with Supabase Authentication to isolate users.
2. **Create isolated subjects** (e.g. "Machine Learning", "History", "Company Docs").
3. **Upload files or paste URLs** — the backend chunks, embeds, and indexes them into subject collections.
4. **Ask questions** — retrieves relevant context and generates grounded answers with citations.
5. **Evaluate** — get Faithfulness + Answer Relevancy scores on every query.

---

## ✨ Features

| Feature | Details |
|---|---|
| **Multi-subject isolation** | Each subject has its own isolated ChromaDB collection |
| **Secure Authentication** | Supabase JWT token verification on all API routes |
| **Robust Storage** | Supports Supabase/PostgreSQL database for subject registry persistence |
| **Document upload** | `.txt`, `.pdf`, `.md`, `.csv`, `.json` files supported |
| **URL ingestion** | Paste any URL and the content gets scraped automatically |
| **Semantic search** | Dense vector search via `all-MiniLM-L6-v2` embeddings (384-dim) |
| **Cross-encoder reranking** | Optional `ms-marco-MiniLM-L-6-v2` reranker for higher precision |
| **3 LLM backends** | Groq, OpenAI, or Ollama (fully local & free) |
| **Dual Interfaces** | Sleek React + Vite production frontend & Gradio playground UI |

---

## 📋 Prerequisites

Before you begin, make sure you have:

- **Python 3.11+** — [Download](https://python.org/downloads/)
- **Node.js (for React frontend)** — [Download](https://nodejs.org/)
- **Supabase Account** — for Auth and PostgreSQL (Database connection string + Anon Public Key)
- **An LLM API key** (choose one):
  - [Groq API Key](https://console.groq.com/)
  - [OpenAI API Key](https://platform.openai.com/api-keys)
  - Or [Ollama](https://ollama.ai/) installed locally (free, no key needed)

---

## 🚀 Setup & Installation

### Step 1: Clone the repository
```bash
git clone https://github.com/sourya-07/NoteBase.git
cd NoteBase
```

### Step 2: Set up Backend Environment
```bash
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 3: Configure Environment Variables
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Configure your `.env` with your settings:
```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres?pgbouncer=true

# LLM Configuration (e.g., Groq)
LLM_PROVIDER=groq
GROQ_API_KEY=gsk_your-api-key-here
GROQ_MODEL=llama-3.1-8b-instant

# Vector Store
CHROMA_PERSIST_DIR=./chroma_data
```

### Step 4: Set up Frontend Environment
Navigate to the `frontend/` folder, install Node packages, and copy the environment template:
```bash
cd frontend
npm install
cp .env.example .env
```

Open `frontend/.env` and update:
```env
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## 💻 Running the App

You can choose to run the **Production React App** or the **Gradio Playground**:

### Option A: Production Web App (React + FastAPI)

1. **Start the FastAPI Backend:**
   Ensure you are in the root directory and your `.venv` is active:
   ```bash
   python3 -m src.api.main
   ```
   The backend API will start on **http://localhost:8000**.

2. **Start the React Frontend:**
   Open a new terminal session, navigate to the `frontend` folder, and run:
   ```bash
   npm run dev
   ```
   The frontend will start on **http://localhost:5173**.

---

### Option B: Local Gradio UI Playground
To run the Gradio interface:
```bash
python app.py
```
Open your browser to **http://localhost:7860**.

---

## 📁 Project Structure

```
.
├── app.py                # Gradio playground UI entry point
├── requirements.txt      # Backend Python dependencies
├── Dockerfile            # Container definition for Python app
├── docker-compose.yml    # Embedded ChromaDB orchestration
├── subjects.json         # Local fallback database for subjects
├── frontend/             # React + Vite frontend application
│   ├── src/              # UI components, pages, custom hooks
│   ├── eslint.config.js  # Linter configuration
│   └── package.json      # Node dependencies
└── src/                  # Core backend codebase
    ├── api/              # API layer (FastAPI router & schemas)
    │   ├── main.py       # Main API entrypoint
    │   └── routes.py     # Endpoint route definitions
    ├── core/             # Configuration & authentication core
    │   ├── auth.py       # Supabase JWT authentication
    │   ├── config.py     # Configuration variables loader
    │   └── database.py   # PostgreSQL / JSON Database handlers
    └── rag/              # Retrieval Augmented Generation logic
        ├── ingest.py     # HTML scraping, text chunking & embedding
        ├── rag_chain.py  # RAG sequence pipeline & QA evaluator
        └── retriever.py  # ChromaDB query fetching & cross-encoder reranking
```

---

## 🏗️ Architecture

```mermaid
flowchart TD
    A[React App / Gradio] -->|HTTPS Requests + Bearer JWT| B[FastAPI Gateway]
    B -->|Validate JWT Token| C[Supabase Auth Service]
    B -->|CRUD Subjects| D[(PostgreSQL Database)]
    B -->|Ingest / Query| E[RAG Pipeline]

    subgraph RAG Pipeline
        E --> F[Query Embedder<br/>all-MiniLM-L6-v2]
        F --> G[(ChromaDB Vector DB)]
        G --> H[Top-K Chunks]
        H --> I{Reranker?}
        I -->|Yes| J[Cross-Encoder Reranker]
        I -->|No| K[Direct Top-K]
        J --> L[Prompt Builder]
        K --> L
        L --> M{LLM Provider}
        M -->|Groq| N[Llama3 8B]
        M -->|OpenAI| O[GPT-4o-mini]
        N --> P[Grounded Answer + Citations]
        O --> P
    end
```

---

## 🌐 Deploying to Production

### 1. Backend on Render
1. Create a **Web Service** pointing to your repository.
2. Select **Python 3** as runtime.
3. Use Build Command: `pip install -r requirements.txt`
4. Use Start Command: `uvicorn src.api.main:app --host 0.0.0.0 --port $PORT`
5. Configure Environment Variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `DATABASE_URL`, `LLM_PROVIDER`, `GROQ_API_KEY`).
6. Optionally attach a Render Disk and set `CHROMA_PERSIST_DIR` to your mounted directory for vector index persistence.

### 2. Frontend on Vercel
1. Import your repository to Vercel.
2. Select **Vite** preset.
3. Change root directory to **`frontend`**.
4. Configure Environment Variables (`VITE_API_URL` set to Render URL, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY`).
5. Click **Deploy**.

---

## 🧪 Testing

### Evaluation Benchmark
Run the evaluation test suite against an indexed subject to check metrics:
```bash
python -m tests.evaluate --index <your_collection_name>
```

### UI Programmatic Tests
To run UI programmatic tests:
```bash
python tests/test_ui.py
```

---

## 📄 License

Apache 2.0 — see [LICENSE](LICENSE).
