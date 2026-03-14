import React from "react";
import SubjectRow from "../subjects/SubjectRow";
import CreateSubjectForm from "../subjects/CreateSubjectForm";

export function SubjectList({
  subjects,
  activeSubjectId,
  onSelectSubject,
  onCreateSubject,
  onDeleteSubject
}) {
  return (
    <div className="flex flex-col h-full bg-[var(--surface)]">
      {/* App Branding */}
      <div className="p-6 border-b border-[var(--border)]">
        <h2 className="text-2xl font-serif font-semibold tracking-tight text-[var(--text-primary)]">
          NoteBase
        </h2>
        <p className="text-xs text-[var(--text-muted)] mt-1 font-sans">
          Personal AI Knowledge Base
        </p>
      </div>

      {/* Subtitle */}
      <div className="px-4 pt-4 pb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
          Research Subjects
        </span>
      </div>

      {/* Subject list */}
      <div className="flex-1 overflow-y-auto min-h-0 py-1">
        {subjects.length === 0 ? (
          <div className="px-4 py-3 text-xs text-[var(--text-muted)] italic">
            No subjects. Create one below to begin.
          </div>
        ) : (
          subjects.map((sub) => (
            <SubjectRow
              key={sub.id}
              subject={sub}
              isActive={sub.id === activeSubjectId}
              onClick={() => onSelectSubject(sub.id)}
              onDelete={onDeleteSubject}
            />
          ))
        )}
      </div>

      {/* Create Subject Link/Form */}
      <CreateSubjectForm onCreateSubject={onCreateSubject} />
    </div>
  );
}

export default SubjectList;
