import { supabase } from "../lib/supabase";

const API_URL = import.meta.env.VITE_API_URL || "/api";

async function request(path, options = {}) {
  const sessionData = await supabase.auth.getSession();
  const token = sessionData.data.session?.access_token;

  const headers = {
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // If the body is not FormData, set content-type to application/json
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  // Ensure API_URL doesn't end with a slash, preventing double slashes
  const cleanApiUrl = API_URL.replace(/\/$/, "");
  const response = await fetch(`${cleanApiUrl}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    console.error("API unauthorized - JWT token is invalid or expired.");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Request failed with status ${response.status}`);
  }

  return response.json();
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
    if (urls) {
      formData.append("urls", urls);
    }
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append("files", file);
      });
    }
    return request("/ingest", {
      method: "POST",
      body: formData,
    });
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
