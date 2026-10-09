import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useNavigate } from "react-router";
import { Shield } from "lucide-react";

/**
 * SuperAdminGuard keeps the admin shell from rendering until the signed-in
 * session is confirmed to be a super admin. The client never holds the
 * super-admin allow-list, so the only source of truth here is the server-side
 * role query exported from Convex.
 */
export function SuperAdminGuard({ children }: { children: React.ReactNode }) {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isAdmin = useQuery(api.users.isSuperAdminUser);

  const isLoading = authLoading || isAdmin === undefined;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth?returnTo=/admin");
    } else if (!isLoading && isAuthenticated && !isAdmin) {
      navigate("/dashboard");
    }
  }, [isLoading, isAuthenticated, isAdmin, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0D0D]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-[#16A34A]/30 border-t-[#16A34A] rounded-full animate-spin" />
          <p className="text-[#A1A1AA] text-sm">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
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
