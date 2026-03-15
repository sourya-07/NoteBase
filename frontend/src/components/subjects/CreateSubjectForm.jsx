import React, { useState, useRef, useEffect } from "react";
import { Plus, X } from "lucide-react";

export function CreateSubjectForm({ onCreateSubject }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onCreateSubject(name.trim());
      setName("");
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Subject name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-sm px-2.5 py-1.5 bg-[var(--bg)] border border-[var(--border)] text-[var(--text-primary)] rounded-sm outline-none focus:ring-1 focus:ring-[var(--accent)] placeholder-[var(--text-muted)]"
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => {
                setName("");
                setIsEditing(false);
              }}
              className="px-2 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 text-xs border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white rounded-sm transition-all"
            >
              Create
            </button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <div className="px-4 py-3 border-t border-[var(--border)]">
      <button
        onClick={() => setIsEditing(true)}
        className="text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] underline underline-offset-4 decoration-1 cursor-pointer"
      >
        New subject
      </button>
    </div>
  );
}

export default CreateSubjectForm;
