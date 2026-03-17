import React from "react";

export function SourceList({ sources }) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-3">
      <h4 className="text-xs uppercase tracking-wider font-bold text-[var(--text-muted)] select-none">
        Sources
      </h4>
      <ol className="flex flex-col gap-2.5">
        {sources.map((src, index) => (
          <li key={src.id} className="text-sm flex items-center gap-2">
            <span className="font-mono text-xs text-[var(--text-muted)]">
              [{index + 1}]
            </span>
            <a
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono hover:text-[var(--accent)] underline decoration-[var(--border)] underline-offset-2 transition-colors truncate"
            >
              {src.name}
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default SourceList;
