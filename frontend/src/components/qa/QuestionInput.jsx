import React, { useState, useEffect } from "react";

export function QuestionInput({ value, onChange, onSubmit, isLoading }) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && value.trim()) {
        onSubmit();
      }
    }
  };

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="relative">
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What do you want to know?"
          disabled={isLoading}
          className="w-full border-0 bg-transparent p-0 text-2xl font-serif font-medium text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:ring-0 focus:outline-none resize-none leading-normal"
        />
        {/* Full-width underline line */}
        <div className="w-full border-b border-[var(--border)] mt-2" />
      </div>

      <div className="flex justify-end items-center">
        <button
          onClick={onSubmit}
          disabled={isLoading || !value.trim()}
          className={`text-sm font-medium tracking-wide flex items-center gap-1.5 transition-colors cursor-pointer select-none ${
            isLoading || !value.trim()
              ? "text-[var(--text-muted)] opacity-60 cursor-not-allowed"
              : "text-[var(--accent)] hover:text-[var(--accent-hover)]"
          }`}
        >
          {isLoading ? "Asking..." : "Ask →"}
        </button>
      </div>
    </div>
  );
}

export default QuestionInput;
