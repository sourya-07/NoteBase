import json
import os
import logging
from src.core.config import SUBJECTS_DB, DATABASE_URL

logger = logging.getLogger(__name__)

# Connection helper for PostgreSQL
def get_conn():
    if not DATABASE_URL:
        return None
    import psycopg2
    import urllib.parse
    
    # Strip unrecognized query parameters like pgbouncer from the connection string
    parsed = urllib.parse.urlparse(DATABASE_URL)
    query_params = urllib.parse.parse_qs(parsed.query)
    if 'pgbouncer' in query_params:
        del query_params['pgbouncer']
    
    new_query = urllib.parse.urlencode(query_params, doseq=True)
    sanitized_url = urllib.parse.urlunparse((
        parsed.scheme,
        parsed.netloc,
        parsed.path,
        parsed.params,
        new_query,
        parsed.fragment
    ))
    
    return psycopg2.connect(sanitized_url)

def init_db():
    """Initializes the database schema if PostgreSQL is configured."""
    if not DATABASE_URL:
        logger.info("DATABASE_URL not set. Falling back to local subjects.json database.")
        return
    
    try:
        conn = get_conn()
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS subjects (
                    id SERIAL PRIMARY KEY,
                    user_id VARCHAR(255) NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    index_name VARCHAR(255) NOT NULL,
                    docs_count INTEGER DEFAULT 0,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(user_id, name)
                );
            """)
            conn.commit()
            logger.info("Supabase PostgreSQL subjects table verified/created successfully.")
        conn.close()
    except Exception as e:
        logger.exception(f"Failed to initialize PostgreSQL database: {e}. Falling back to subjects.json.")

def load_subjects(user_id='gradio_default_user'):
    """Loads subjects for the given user, falling back to local JSON if DB is not configured."""
    if not DATABASE_URL:
        if not os.path.exists(SUBJECTS_DB):
            return {}
        try:
            with open(SUBJECTS_DB, "r") as f:
                return json.load(f)
        except Exception:
            return {}
            
    try:
        conn = get_conn()
        subjects = {}
        with conn.cursor() as cur:
            cur.execute(
                "SELECT name, index_name, docs_count, created_at FROM subjects WHERE user_id = %s",
                (user_id,)
            )
            for row in cur.fetchall():
                name, index_name, docs_count, created_at = row
                subjects[name] = {
                    "index_name": index_name,
                    "docs_count": docs_count,
                    "created_at": created_at.isoformat() if hasattr(created_at, 'isoformat') else str(created_at)
                }
        conn.close()
        return subjects
    except Exception as e:
        logger.error(f"Error loading subjects from PostgreSQL for user {user_id}: {e}. Falling back to JSON.")
        if not os.path.exists(SUBJECTS_DB):
            return {}
        try:
            with open(SUBJECTS_DB, "r") as f:
                return json.load(f)
        except Exception:
            return {}

def save_subjects(subjects, user_id='gradio_default_user'):
    """Saves/synchronizes subjects, falling back to local JSON if DB is not configured."""
    if not DATABASE_URL:
        try:
            with open(SUBJECTS_DB, "w") as f:
                json.dump(subjects, f, indent=4)
        except Exception as e:
            logger.error(f"Failed to save local subjects database: {e}")
        return

    try:
        conn = get_conn()
        with conn.cursor() as cur:
            # 1. Fetch current subjects in DB for this user
            cur.execute("SELECT name, index_name, docs_count FROM subjects WHERE user_id = %s", (user_id,))
            db_subjects = {row[0]: {"index_name": row[1], "docs_count": row[2]} for row in cur.fetchall()}
            
            # 2. Delete subjects that are in DB but not in the new dictionary
            for name in db_subjects:
                if name not in subjects:
                    cur.execute("DELETE FROM subjects WHERE user_id = %s AND name = %s", (user_id, name))
            
            # 3. Insert or update subjects
            for name, info in subjects.items():
                index_name = info["index_name"]
                # Supports both docs_count (backend) and docCount (frontend mapping)
                docs_count = info.get("docs_count", info.get("docCount", 0))
                if name not in db_subjects:
                    cur.execute(
                        "INSERT INTO subjects (user_id, name, index_name, docs_count) VALUES (%s, %s, %s, %s)",
                        (user_id, name, index_name, docs_count)
                    )
                else:
                    cur.execute(
                        "UPDATE subjects SET docs_count = %s WHERE user_id = %s AND name = %s",
                        (docs_count, user_id, name)
                    )
            conn.commit()
        conn.close()
    except Exception as e:
        logger.error(f"Error synchronizing subjects to PostgreSQL for user {user_id}: {e}. Falling back to JSON.")
        try:
            with open(SUBJECTS_DB, "w") as f:
                json.dump(subjects, f, indent=4)
        except Exception:
            pass

def get_subject_index_name(subject_name, user_id='gradio_default_user'):
    subjects = load_subjects(user_id)
    return subjects.get(subject_name, {}).get("index_name")

def create_or_get_subject(subject_name, user_id='gradio_default_user'):
    subjects = load_subjects(user_id)
    if subject_name not in subjects:
        # Create a URL friendly index name
        index_name = "".join(c if c.isalnum() else "_" for c in subject_name).lower()
        if not index_name:
            index_name = "default_" + os.urandom(4).hex()
            
        subjects[subject_name] = {
            "index_name": index_name,
            "docs_count": 0,
            "created_at": __import__('datetime').datetime.now().isoformat()
        }
        save_subjects(subjects, user_id)
    
    return subjects[subject_name]["index_name"]
