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

  // Auto-assign super_admin role when mahinhosen870@gmail.com signs in
  useEffect(() => {
    const adminEmails = ["mahinhosen870@gmail.com", "atazwar103@gmail.com"];
    if (isAuthenticated && user && adminEmails.includes(user.email?.toLowerCase() ?? "") && user.role !== "admin") {
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
