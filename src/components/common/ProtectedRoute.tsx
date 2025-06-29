import * as React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  requireAdmin?: boolean;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  requireAdmin = false,
  fallback = null,
}: ProtectedRouteProps): JSX.Element | null {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return fallback as any;
  }
  if (requireAdmin && user.role !== "admin") {
    return fallback as any;
  }
  return <Outlet />;
}
