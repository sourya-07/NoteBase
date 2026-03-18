import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import useAuth from "./hooks/useAuth";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import WorkspacePage from "./pages/WorkspacePage";

function RouteGuard({ children, user, loading }) {
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <Loader2 className="animate-spin text-[var(--accent)]" size={32} />
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
}

export function App() {
  const { user, loading, logout } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={!loading && user ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={!loading && user ? <Navigate to="/" replace /> : <RegisterPage />}
        />
        <Route
          path="/"
          element={
            <RouteGuard user={user} loading={loading}>
              <WorkspacePage user={user} logout={logout} />
            </RouteGuard>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
