import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";

export function useSubjects(session) {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeSubjectId, setActiveSubjectId] = useState(() => {
    return localStorage.getItem("notebase_active_subject_id") || "";
  });

  const fetchSubjects = useCallback(async () => {
    if (!session) return;
    try {
      setLoading(true);
      setError(null);
      const data = await api.getSubjects();
      setSubjects(data);
      if (data.length > 0 && (!activeSubjectId || !data.some(s => s.id === activeSubjectId))) {
        setActiveSubjectId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch subjects:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  useEffect(() => {
    if (activeSubjectId) {
      localStorage.setItem("notebase_active_subject_id", activeSubjectId);
    }
  }, [activeSubjectId]);

  const activeSubject = subjects.find((s) => s.id === activeSubjectId) || null;

  const createSubject = async (name) => {
    if (!name.trim()) return null;
    try {
      const newSubject = await api.createSubject(name);
      setSubjects((prev) => [...prev, newSubject]);
      setActiveSubjectId(newSubject.id);
      return newSubject;
    } catch (err) {
      console.error("Failed to create subject:", err);
      alert(err.message || "Failed to create subject");
      return null;
    }
  };

  const deleteSubject = async (id) => {
    try {
      await api.deleteSubject(id);
      setSubjects((prev) => {
        const filtered = prev.filter((s) => s.id !== id);
        if (activeSubjectId === id && filtered.length > 0) {
          setActiveSubjectId(filtered[0].id);
        } else if (filtered.length === 0) {
          setActiveSubjectId("");
        }
        return filtered;
      });
    } catch (err) {
      console.error("Failed to delete subject:", err);
      alert(err.message || "Failed to delete subject");
    }
  };

  const addDocumentsToSubject = async (subjectId, files, urlsList = [], reset = false) => {
    try {
      const urlsStr = urlsList.join("\n");
      const result = await api.ingest(subjectId, files, urlsStr, reset);
      setSubjects((prev) =>
        prev.map((s) => {
          if (s.id !== subjectId) return s;
          return {
            ...s,
            documents: result.documents,
            docCount: result.docCount,
          };
        })
      );
      return result;
    } catch (err) {
      console.error("Failed to ingest documents:", err);
      alert(err.message || "Failed to ingest documents");
      throw err;
    }
  };

  const deleteDocumentFromSubject = async (subjectId, docId) => {
    try {
      await api.deleteDocument(subjectId, docId);
      setSubjects((prev) =>
        prev.map((s) => {
          if (s.id !== subjectId) return s;
          const updatedDocs = s.documents.filter((d) => d.id !== docId);
          return {
            ...s,
            documents: updatedDocs,
            docCount: updatedDocs.length,
          };
        })
      );
    } catch (err) {
      console.error("Failed to delete document:", err);
      alert(err.message || "Failed to delete document");
    }
  };

  return {
    subjects,
    activeSubject,
    activeSubjectId,
    setActiveSubjectId,
    createSubject,
    deleteSubject,
    addDocumentsToSubject,
    deleteDocumentFromSubject,
    loading,
    error,
    refresh: fetchSubjects,
  };
}

export default useSubjects;
