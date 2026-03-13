import React from "react";
import { LogOut } from "lucide-react";
import SubjectList from "./SubjectList";
import ThemeToggle from "./ThemeToggle";

export function Shell({
  children,
  subjects,
  activeSubjectId,
  onSelectSubject,
  onCreateSubject,
  onDeleteSubject,
  user,
  onLogout
}) {
  return (
    <div className="flex w-screen h-screen overflow-hidden bg-[var(--bg)] text-[var(--text-primary)] transition-colors duration-200">
      {/* Left panel: Sidebar */}
      <aside className="w-[260px] shrink-0 h-full border-r border-[var(--border)] bg-[var(--surface)] flex flex-col justify-between select-none">
        <div className="flex-1 overflow-hidden">
          <SubjectList
            subjects={subjects}
            activeSubjectId={activeSubjectId}
            onSelectSubject={onSelectSubject}
            onCreateSubject={onCreateSubject}
            onDeleteSubject={onDeleteSubject}
          />
        </div>

        {/* User Info & Logout */}
        {user && (
          <div className="px-4 py-3 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--text-muted)] bg-[var(--mono-bg)]/30">
            <div className="min-w-0 pr-2">
              <p className="font-mono truncate" title={user.email}>{user.email}</p>
            </div>
            <button
              onClick={onLogout}
              className="text-[var(--text-muted)] hover:text-red-500 transition-colors p-1 rounded hover:bg-[var(--border)] cursor-pointer shrink-0"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}

        <ThemeToggle />
      </aside>

      {/* Right panel: Main Content */}
      <main className="flex-1 h-full overflow-y-auto bg-[var(--bg)] flex flex-col">
        {children}
      </main>
    </div>
  );
}

export default Shell;

