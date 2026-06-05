import { useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  // No authentication required - always authenticated
  const state = useMemo(() => {
    return {
      user: { id: 1, name: "Usuário", email: "user@felixadm.local", role: "user" },
      loading: false,
      error: null,
      isAuthenticated: true,
    };
  }, []);

  const logout = async () => {
    // No-op for non-authenticated app
    console.log("Logout called (no-op)");
  };

  return {
    ...state,
    refresh: () => Promise.resolve(),
    logout,
  };
}
