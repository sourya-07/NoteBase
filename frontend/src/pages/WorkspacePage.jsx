import React, { useState } from "react";
import Shell from "../components/layout/Shell";
import EmptyState from "../components/common/EmptyState";
import FileDropzone from "../components/subjects/FileDropzone";
import URLTextarea from "../components/subjects/URLTextarea";
import DocumentList from "../components/subjects/DocumentList";
import QuestionInput from "../components/qa/QuestionInput";
import ExampleLinks from "../components/qa/ExampleLinks";
import AnswerBlock from "../components/qa/AnswerBlock";
import SourceList from "../components/qa/SourceList";
import MetricsDisplay from "../components/qa/MetricsDisplay";
import ContextDrawer from "../components/qa/ContextDrawer";
import useSubjects from "../hooks/useSubjects";
import { api } from "../services/api";
import { Loader2, Server, RefreshCw } from "lucide-react";
import LandingPage from "./LandingPage";

export function WorkspacePage({ user, logout }) {
  const [view, setView] = useState("landing"); // "landing" | "workspace"
  const [activeTab, setActiveTab] = useState("ask"); // "ask" | "manage"

  // Subjects state manager hook connected to real API
  const {
    subjects,
    activeSubject,
    activeSubjectId,
    setActiveSubjectId,
    createSubject,
    deleteSubject,
    addDocumentsToSubject,
    deleteDocumentFromSubject,
    loading: subjectsLoading,
    warmingUp,
    wakeUpSeconds,
    error: subjectsError,
    refresh: refreshSubjects,
  } = useSubjects(user);

  // Content state for Manage Tab
  const [urls, setUrls] = useState("");
  const [isAddingContent, setIsAddingContent] = useState(false);

  // QA state for Ask Tab
  const [question, setQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [qaResult, setQaResult] = useState(null);

  // 1. Landing View Render
  if (view === "landing") {
    return <LandingPage user={user} onBegin={() => setView("workspace")} />;
  }

  // 2. Backend warming up (Render free-tier cold start)
  if (warmingUp) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-5 max-w-sm text-center px-6">
          <div className="relative">
            <Server className="text-[var(--accent)] opacity-80" size={48} />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--accent)]"></span>
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Server is waking up, please wait...
            </h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              The backend runs on a free tier and spins down after inactivity.
              It usually takes <strong>30–60 seconds</strong> to wake up.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] bg-[var(--surface)] px-4 py-2 rounded-full border border-[var(--border)]">
            <Loader2 className="animate-spin" size={12} />
            {wakeUpSeconds > 0 ? `${wakeUpSeconds}s elapsed` : "Connecting…"}
          </div>
        </div>
      </div>
    );
  }

  // 3. Error state (backend unreachable after timeout)
  if (subjectsError && !subjectsLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-sm text-center px-6">
          <Server className="text-red-400" size={40} />
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              Could not reach the server
            </h2>
            <p className="text-sm text-[var(--text-muted)]">{subjectsError}</p>
          </div>
          <button
            onClick={refreshSubjects}
            className="flex items-center gap-2 text-sm border border-[var(--accent)] text-[var(--accent)] px-4 py-2 rounded hover:bg-[var(--accent)] hover:text-white transition-all cursor-pointer"
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // 4. Initial subjects loading spinner
  if (subjectsLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[var(--accent)]" size={32} />
          <span className="text-sm font-mono text-[var(--text-muted)]">Opening vault drawers...</span>
        </div>
      </div>
    );
  }

  const handleAddContent = async (draggedFiles = null) => {
    if (!activeSubject) return;

    setIsAddingContent(true);
    try {
      let fileList = [];
      if (draggedFiles) {
        fileList = draggedFiles;
      }
      const urlList = urls.split("\n").filter(u => u.trim());
      await addDocumentsToSubject(activeSubject.id, fileList, urlList);
      setUrls("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingContent(false);
    }
  };

  // 3. Question Submission Handler
  const handleAsk = async (selectedQuestion = null) => {
    const query = (selectedQuestion || question).trim();
    if (!query || !activeSubject) return;

    setQuestion(query);
    setIsAsking(true);
    setQaResult(null);

    try {
      const response = await api.query(activeSubject.id, query);
      setQaResult(response);
    } catch (err) {
      console.error(err);
      alert("Failed to query RAG model: " + err.message);
    } finally {
      setIsAsking(false);
    }
  };

  // Helper for quick examples clicks
  const handleSelectExample = (ex) => {
    setQuestion(ex);
    handleAsk(ex);
  };



  return (
    <Shell
      subjects={subjects}
      activeSubjectId={activeSubjectId}
      onSelectSubject={(id) => {
        setActiveSubjectId(id);
        setQaResult(null);
        setQuestion("");
      }}
      onCreateSubject={createSubject}
      onDeleteSubject={deleteSubject}
      user={user}
      onLogout={logout}
    >
      {activeSubject ? (
        <div className="flex-1 flex flex-col h-full">
          {/* Main workspace header banner */}
          <div className="px-8 py-8 border-b border-[var(--border)] bg-[var(--surface)] shrink-0 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-serif font-medium text-[var(--text-primary)]">
                {activeSubject.name}
              </h1>
              <p className="text-sm text-[var(--text-muted)] mt-1 font-sans">
                {activeSubject.docCount} {activeSubject.docCount === 1 ? "document" : "documents"} indexed
              </p>
            </div>
            <button
              onClick={() => setView("landing")}
              className="text-xs border border-[var(--border)] px-3 py-1.5 rounded hover:bg-[var(--mono-bg)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all font-mono cursor-pointer"
            >
              ← Cover
            </button>
          </div>

          {/* Underline Tabs bar */}
          <div className="px-8 border-b border-[var(--border)] bg-[var(--surface)] shrink-0 flex gap-6">
            <button
              onClick={() => setActiveTab("ask")}
              className={`py-3 text-sm font-medium tracking-wide transition-all border-b-2 cursor-pointer ${
                activeTab === "ask"
                  ? "border-[var(--accent)] text-[var(--text-primary)] font-semibold"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border)]"
              }`}
            >
              Ask
            </button>
            <button
              onClick={() => setActiveTab("manage")}
              className={`py-3 text-sm font-medium tracking-wide transition-all border-b-2 cursor-pointer ${
                activeTab === "manage"
                  ? "border-[var(--accent)] text-[var(--text-primary)] font-semibold"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border)]"
              }`}
            >
              Manage
            </button>
          </div>

          {/* Tab Content Panel */}
          <div className="flex-1 overflow-y-auto px-8 py-8 flex flex-col min-h-0">
            {activeTab === "ask" && (
              <div className="flex-col flex gap-8 w-full max-w-3xl">
                {/* Question form wrapper */}
                <QuestionInput
                  value={question}
                  onChange={setQuestion}
                  onSubmit={() => handleAsk()}
                  isLoading={isAsking}
                />

                {/* Example click triggers when not active asking/answering */}
                {!isAsking && !qaResult && (
                  <ExampleLinks onSelectExample={handleSelectExample} />
                )}

                {/* Displaying AI Answer response if loaded */}
                {qaResult && !isAsking && (
                  <div className="flex flex-col gap-6 mt-4">
                    <AnswerBlock answer={qaResult.answer} />
                    <SourceList sources={qaResult.sources} />
                    <MetricsDisplay metrics={qaResult.metrics} />
                    <ContextDrawer chunks={qaResult.chunks} />
                  </div>
                )}
                
                {/* Empty State when no question or answer */}
                {!isAsking && !qaResult && (
                  <div className="mt-8 border border-dashed border-[var(--border)] py-8 rounded-sm">
                    <EmptyState
                      title="Ready for Inquiry"
                      description="Enter a question above or click one of the suggestions to query your notes database."
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === "manage" && (
              <div className="flex-col flex gap-8 w-full max-w-xl">
                {/* Drag and Drop File zone */}
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    Documents
                  </span>
                  <FileDropzone onFilesAdded={(files) => handleAddContent(files)} />
                </div>

                {/* Plain Text area input for URL adding */}
                <URLTextarea value={urls} onChange={setUrls} />

                {/* Outlined Action Submit Add Button */}
                <div className="flex justify-start">
                  <button
                    onClick={() => handleAddContent()}
                    disabled={isAddingContent || (!urls.trim())}
                    className={`border border-[var(--accent)] text-[var(--accent)] px-5 py-2 rounded text-sm tracking-wide font-medium transition-all duration-200 select-none ${
                      isAddingContent || (!urls.trim())
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:bg-[var(--accent)] hover:text-white cursor-pointer"
                    }`}
                  >
                    {isAddingContent ? "Adding..." : "Add to Notes"}
                  </button>
                </div>

                {/* Border Divider line */}
                <div className="w-full border-t border-[var(--border)] pt-4" />

                {/* Indexed documents table listing */}
                <DocumentList
                  documents={activeSubject.documents || []}
                  onDeleteDocument={(docId) => deleteDocumentFromSubject(activeSubject.id, docId)}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-8">
          <EmptyState
            title="No Active Subject"
            description="Create a subject on the left panel to begin archiving your scholarly inquiries."
          />
        </div>
      )}
    </Shell>
  );
}

export default WorkspacePage;
