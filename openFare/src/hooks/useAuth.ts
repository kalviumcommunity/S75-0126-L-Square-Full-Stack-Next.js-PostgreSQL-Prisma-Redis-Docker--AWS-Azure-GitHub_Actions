import { useAuthContext } from "@/context/AuthContext";

export function useAuth() {
  const { user, login, logout, isAuthenticated } = useAuthContext();

  return {
    user,
    login,
    logout,
    isAuthenticated,
  };
}