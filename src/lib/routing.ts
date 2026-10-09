import React from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Shield, Lock } from "lucide-react";

/**
 * Super admin allow-list routing helper.
 *
 * IMPORTANT: this module intentionally no longer holds the allow-list. The
 * canonical server-side list lives in src/convex/users.ts and is env-driven.
 * Client-side isAdminEmail always returns false so the allow-list never leaks
 * into the browser bundle. Any route/provisional UI that needs super-admin
 * gating must still be enforced server-side in Convex.
 */
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
      <div className="min-h-screen flex items-center justify-center bg-[#0D0D0D]">
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
      <div className="min-h-screen flex items-center justify-center bg-[#0D0D0D]">
        <div className="text-center">
          <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-[#A1A1AA] text-sm">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function ProtectedRouteWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

/**
 * Inline block shown to non-admin users when they try to access admin routes.
 * Used in the table of contents sidebar and navigation links.
 */
export function AdminOnlyNotice() {
  return (
    <div className="flex items-center gap-2 text-[#A1A1AA] text-xs">
      <Lock className="w-3.5 h-3.5" />
      <span>Admin only</span>
    </div>
  );
}
