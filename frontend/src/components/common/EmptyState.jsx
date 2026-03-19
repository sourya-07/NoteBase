import React from "react";

export function EmptyState({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center select-none animate-fade-in max-w-md mx-auto">
      {title && (
        <h4 className="text-lg font-serif font-medium text-[var(--text-primary)] mb-2">
          {title}
        </h4>
      )}
      {description && (
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

export default EmptyState;
