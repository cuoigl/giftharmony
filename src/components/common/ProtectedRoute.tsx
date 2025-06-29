import * as React from "react";
import { useAuth } from "../../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  fallback?: React.ReactNode;
}

export const ProtectedRoute = ({
  children,
  requireAdmin = false,
  fallback = null,
}: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return fallback;
  }
  if (requireAdmin && user.role !== "admin") {
    return fallback;
  }
  return <>{children}</>;
};
