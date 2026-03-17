import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export function ContextDrawer({ chunks }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!chunks || chunks.length === 0) return null;

  return (
    <div className="w-full border border-[var(--border)] bg-[var(--surface)] rounded-sm overflow-hidden select-none">
      {/* Drawer Header */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 text-xs uppercase tracking-wider font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg)] transition-colors duration-150 cursor-pointer"
      >
        <span>Retrieved Context Chunks ({chunks.length})</span>
        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* Monospace content */}
      {isOpen && (
        <div className="px-4 py-4 border-t border-[var(--border)] bg-[var(--mono-bg)] flex flex-col gap-4 max-h-[300px] overflow-y-auto">
          {chunks.map((chunk, index) => (
            <div key={index} className="flex flex-col gap-1.5">
              <span className="text-[10px] font-mono font-bold text-[var(--accent)]">
                CHUNK [{index + 1}]
              </span>
              <pre className="text-xs font-mono text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed select-text font-normal">
                {chunk}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ContextDrawer;
