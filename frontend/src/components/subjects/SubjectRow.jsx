import React from "react";
import { Trash2, BookOpen } from "lucide-react";

export function SubjectRow({ subject, isActive, onClick, onDelete }) {
  const handleDelete = (e) => {
    e.stopPropagation(); // prevent selecting the subject when deleting
    if (confirm(`Are you sure you want to delete the subject "${subject.name}"?`)) {
      onDelete(subject.id);
    }
  };

  return (
    <div
      onClick={onClick}
      className={`group relative flex items-center justify-between px-4 py-3 cursor-pointer transition-all duration-150 border-l-2 ${
        isActive
          ? "border-[var(--accent)] bg-[var(--mono-bg)] text-[var(--text-primary)]"
          : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg)]"
      }`}
    >
      <div className="flex items-start gap-2.5 min-w-0 pr-6">
        <BookOpen size={16} className={`mt-0.5 shrink-0 ${isActive ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`} />
        <div className="min-w-0">
          <p className="font-medium text-sm truncate">{subject.name}</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {subject.docCount} {subject.docCount === 1 ? "document" : "documents"} • {subject.lastUpdated}
          </p>
        </div>
      </div>

      <button
        onClick={handleDelete}
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-[var(--text-muted)] hover:text-red-500 shrink-0 p-1 rounded hover:bg-[var(--border)] cursor-pointer"
        title="Delete Subject"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

export default SubjectRow;
