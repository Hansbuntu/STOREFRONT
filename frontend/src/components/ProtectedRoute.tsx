import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: "admin" | "seller" | "buyer";
}

export function ProtectedRoute({
  children,
  requireRole,
}: ProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-sm text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`/login?returnTo=${encodeURIComponent(returnTo)}`}
        replace
      />
    );
  }

  if (requireRole) {
    if (requireRole === "admin" && user?.role !== "admin") {
      return <Navigate to="/" replace />;
    }
    if (requireRole === "seller" && user?.role !== "seller" && user?.role !== "admin") {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
