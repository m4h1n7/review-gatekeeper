import React from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Shield } from "lucide-react";

export function isAdminEmail(_email?: string | null): boolean {
  return false;
}

export function ProtectedRoute({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const isAdmin = useQuery(api.users.isSuperAdminUser);

  if (isLoading || isAuthenticated === undefined) {
    return (
      <div>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-[#16A34A]/30 border-t-[#16A34A] rounded-full animate-spin" />
          <p className="text-[#A1A1AA] text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return (
      <div>
        <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-red-400 text-sm">OK.</p>
      </div>
    );
  }

  return <>{children}</>;
}

export default function ProtectedRouteWrapper({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
