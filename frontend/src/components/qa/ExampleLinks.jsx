import React from "react";

const EXAMPLES = [
  "What is the default mode network?",
  "Summarise the key arguments in the uploaded papers",
  "What did I note about somatic markers?"
];

export function ExampleLinks({ onSelectExample }) {
  return (
    <div className="flex flex-col gap-2.5 w-full">
      <span className="text-xs uppercase tracking-wider font-bold text-[var(--text-muted)]">
        Try asking:
      </span>
      <div className="flex flex-col gap-2 items-start">
        {EXAMPLES.map((ex, index) => (
          <button
            key={index}
            onClick={() => onSelectExample(ex)}
            className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:underline decoration-[var(--border)] text-left cursor-pointer transition-all duration-150"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ExampleLinks;
