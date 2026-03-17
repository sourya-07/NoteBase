import React from "react";

export function MetricsDisplay({ metrics }) {
  if (!metrics) return null;

  const { faithfulness, relevancy, latency } = metrics;

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 py-2 px-3 border border-[var(--border)] bg-[var(--surface)] rounded-sm max-w-max select-none text-xs font-mono text-[var(--text-muted)]">
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        <span>Faithfulness:</span>
        <span className="font-semibold text-[var(--text-primary)]">
          {Math.round(faithfulness * 100)}%
        </span>
      </div>
      
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        <span>Relevancy:</span>
        <span className="font-semibold text-[var(--text-primary)]">
          {Math.round(relevancy * 100)}%
        </span>
      </div>

      <div className="flex items-center gap-1.5 border-l border-[var(--border)] pl-6">
        <span>Latency:</span>
        <span className="font-semibold text-[var(--text-primary)]">
          {latency}s
        </span>
      </div>
    </div>
  );
}

export default MetricsDisplay;
