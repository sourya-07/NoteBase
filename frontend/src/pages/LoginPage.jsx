import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Book, Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4 transition-colors duration-200">
      <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-sm p-8 shadow-sm flex flex-col gap-6 select-none relative overflow-hidden">
        {/* Subtle decorative top bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--accent)]" />

        {/* Logo and Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="p-3 bg-[var(--mono-bg)] rounded-full text-[var(--accent)]">
            <Book size={28} strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-serif font-semibold tracking-tight text-[var(--text-primary)] mt-2">
            NoteBase
          </h1>
          <p className="text-xs text-[var(--text-muted)] tracking-wider uppercase font-mono">
            Vault Authentication
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-sm text-sm text-red-600 dark:text-red-400">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                <Mail size={16} />
              </span>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. scholar@university.edu"
                className="w-full bg-[var(--mono-bg)] text-[var(--text-primary)] placeholder-[var(--text-muted)] opacity-80 focus:opacity-100 border border-[var(--border)] focus:border-[var(--accent)] rounded-sm py-2.5 pl-10 pr-4 text-sm outline-none transition-all duration-150"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]" htmlFor="password">
                Password
              </label>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                <Lock size={16} />
              </span>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[var(--mono-bg)] text-[var(--text-primary)] placeholder-[var(--text-muted)] opacity-80 focus:opacity-100 border border-[var(--border)] focus:border-[var(--accent)] rounded-sm py-2.5 pl-10 pr-4 text-sm outline-none transition-all duration-150"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full border border-[var(--text-primary)] text-[var(--text-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg)] font-mono text-sm tracking-wide py-3 rounded-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Unlocking Vault...
              </>
            ) : (
              "Open Vault →"
            )}
          </button>
        </form>

        {/* Footer/Navigation */}
        <div className="text-center text-xs text-[var(--text-muted)] border-t border-[var(--border)] pt-4 mt-2">
          <span>New to NoteBase? </span>
          <Link
            to="/register"
            className="text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium hover:underline underline-offset-4"
          >
            Create a vault archive
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
