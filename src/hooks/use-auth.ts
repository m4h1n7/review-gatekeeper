import { useEffect } from "react";
import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery, useMutation } from "convex/react";

export function useAuth() {
  const { isLoading: isAuthLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.currentUser);
  const { signIn, signOut } = useAuthActions();
  const ensureSuperAdminRole = useMutation(api.users.ensureSuperAdminRole);

  // Derive isLoading directly from the dependencies instead of managing separate state
  const isLoading = isAuthLoading || user === undefined;

  // Auto-assign admin role on sign-in when the server says this user is a super admin.
  // The authoritative admin allow-list lives server-side (convex/admin.ts +
  // convex/users.ts). Do NOT duplicate it here — the client must never carry the
  // list of admin emails.
  useEffect(() => {
    if (isAuthenticated && user && user.role !== "admin") {
      ensureSuperAdminRole().catch(() => {
        // Silently fail — role assignment will retry on next visit
      });
    }
  }, [isAuthenticated, user?.email, user?.role, ensureSuperAdminRole]);

  return {
    isLoading,
    isAuthenticated,
    user,
    signIn,
    signOut,
  };
}
