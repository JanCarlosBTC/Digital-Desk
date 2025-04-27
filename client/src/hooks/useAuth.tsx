import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

export function useAuth() {
  const [, setLocation] = useLocation();

  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Helper function to redirect to login
  const redirectToLogin = () => {
    window.location.href = "/api/login";
  };

  // Helper function to logout
  const logout = () => {
    window.location.href = "/api/logout";
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    redirectToLogin,
    logout,
    refetch
  };
}