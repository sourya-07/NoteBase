import React from "react";
import { Book } from "lucide-react";

export function LandingPage({ user, onBegin }) {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col justify-between p-8 text-[var(--text-primary)] transition-colors duration-200">
      {/* Landing Header */}
      <header className="flex justify-between items-center w-full max-w-5xl mx-auto select-none">
        <h1 className="text-xl font-serif font-semibold tracking-tight">NoteBase</h1>
        <span className="text-xs font-mono text-[var(--text-muted)] tracking-wider">EST. 2024</span>
      </header>

      {/* Landing Content Container */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto text-center gap-8 my-12">
        {/* Illustration Mock */}
        <div className="relative w-48 h-64 border border-[var(--border)] bg-[var(--surface)] shadow-sm rounded-sm p-4 flex flex-col justify-between select-none rotate-[-2deg] hover:rotate-0 transition-transform duration-300">
          <div className="w-full flex justify-between border-b border-[var(--border)] pb-2 text-[var(--text-muted)] font-mono text-[10px]">
            <span>VOL. I</span>
            <span>INDEX: AUTO</span>
          </div>
          <div className="flex flex-col items-center justify-center flex-1">
            <Book size={48} strokeWidth={1} className="text-[var(--accent)]" />
            <div className="w-12 h-0.5 bg-[var(--border)] mt-4" />
            <div className="w-8 h-0.5 bg-[var(--border)] mt-2" />
          </div>
          <div className="w-full text-center text-xs font-serif italic text-[var(--text-muted)]">
            Notebook Archive
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-4xl font-serif font-medium tracking-tight">
            A home for your thoughts.
          </h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-sm mx-auto">
            Organize your research, upload your documents, and converse with your own knowledge base.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 w-full">
          <button
            onClick={onBegin}
            className="border border-[var(--text-primary)] text-[var(--text-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg)] px-8 py-3 rounded-sm font-mono text-sm tracking-wide transition-all duration-200 w-full cursor-pointer shadow-sm hover:shadow"
          >
            Begin your collection →
          </button>
          {user && (
            <div className="text-xs text-[var(--text-muted)]">
              Logged in as <span className="font-mono font-semibold">{user.email}</span>
            </div>
          )}
        </div>
      </main>

      {/* Landing Footer */}
      <footer className="text-center select-none w-full max-w-5xl mx-auto">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] opacity-60">
          Precision & Clarity
        </span>
      </footer>
    </div>
  );
}

export default LandingPage;
