import React from "react";

export function URLTextarea({ value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-sm font-medium text-[var(--text-primary)]">
        URLs
      </label>
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste URLs here, one per line"
        className="w-full px-3 py-2 text-sm border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] rounded-sm outline-none focus:ring-1 focus:ring-[var(--accent)] placeholder-[var(--text-muted)] resize-y"
      />
    </div>
  );
}

export default URLTextarea;
