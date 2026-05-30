import { supabase } from "../lib/supabase";

const API_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

// ─── Wake-up Ping ─────────────────────────────────────────────────────────────
// Polls /health until the backend responds 200 or timeout reached.
// Returns true if backend is alive, false otherwise.
export async function wakeUpBackend(onProgress, maxWaitMs = 90000) {
  const baseUrl = API_URL.replace(/\/api$/, "");
  const healthUrl = `${API_URL}/health`;
  const started = Date.now();

  while (Date.now() - started < maxWaitMs) {
    try {
      const res = await fetch(healthUrl, { method: "GET", cache: "no-store" });
      if (res.ok) return true;
    } catch {
      // still sleeping — keep polling
    }
    const elapsed = Math.round((Date.now() - started) / 1000);
    if (onProgress) onProgress(elapsed);
    await new Promise((r) => setTimeout(r, 4000));
  }
  return false;
}

// ─── Sleep helper ─────────────────────────────────────────────────────────────
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Core request with auto-retry ─────────────────────────────────────────────
async function request(path, options = {}, retries = MAX_RETRIES) {
  const sessionData = await supabase.auth.getSession();
  const token = sessionData.data.session?.access_token;

  const headers = { ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
      });

      if (response.status === 502 || response.status === 503) {
        // Backend is cold-starting — wait and retry
        if (attempt < retries) {
          await sleep(RETRY_DELAY_MS);
          continue;
        }
        throw new Error("Backend is starting up. Please wait a moment and try again.");
      }

      if (response.status === 401) {
        console.error("API unauthorized — JWT token is invalid or expired.");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Request failed with status ${response.status}`);
      }

      return response.json();
    } catch (err) {
      // Network error (ERR_FAILED) = Render is cold-starting — retry
      const isNetworkError =
        err instanceof TypeError && err.message.toLowerCase().includes("failed to fetch");
      if (isNetworkError && attempt < retries) {
        await sleep(RETRY_DELAY_MS);
        continue;
      }
      throw err;
    }
  }
}

export const api = {
  // Get all subjects
  getSubjects: () => request("/subjects"),

  // Create a subject
  createSubject: (name) =>
    request("/subjects", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  // Delete a subject
  deleteSubject: (subjectId) =>
    request(`/subjects/${subjectId}`, {
      method: "DELETE",
    }),

  // Delete a document
  deleteDocument: (subjectId, docId) =>
    request(`/subjects/${subjectId}/documents/${encodeURIComponent(docId)}`, {
      method: "DELETE",
    }),

  // Ingest files & urls
  ingest: (subjectId, files, urls, reset = false) => {
    const formData = new FormData();
    formData.append("subject_id", subjectId);
    formData.append("reset", reset ? "true" : "false");
    if (urls) formData.append("urls", urls);
    if (files && files.length > 0) {
      files.forEach((file) => formData.append("files", file));
    }
    return request("/ingest", { method: "POST", body: formData });
  },

  // Query RAG chain
  query: (subjectId, question, options = {}) =>
    request("/query", {
      method: "POST",
      body: JSON.stringify({
        subject_id: subjectId,
        question,
        top_k: options.topK || 5,
        category_filter: options.categoryFilter || null,
        use_reranker: options.useReranker !== false,
      }),
    }),
};

export default api;
