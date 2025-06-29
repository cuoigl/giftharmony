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
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-500 mb-3 mx-auto" />
          <p className="text-gray-600">Đang kiểm tra đăng nhập...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return fallback as any;
  }

  if (requireAdmin && user.role !== "admin") {
    return fallback as any;
  }

  return <Outlet />;
}
