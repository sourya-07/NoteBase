import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors duration-200 border-t border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg)]"
      aria-label="Toggle Theme"
    >
      <span className="flex items-center gap-2">
        {theme === "dark" ? (
          <>
            <Moon size={16} className="text-[var(--accent)]" />
            <span>Dark Mode</span>
          </>
        ) : (
          <>
            <Sun size={16} className="text-[var(--accent)]" />
            <span>Light Mode</span>
          </>
        )}
      </span>
      <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 border border-[var(--border)] rounded text-[var(--text-muted)]">
        {theme}
      </span>
    </button>
  );
}

export default ThemeToggle;
