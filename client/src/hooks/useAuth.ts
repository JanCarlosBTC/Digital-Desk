import { useQuery } from "@tanstack/react-query";

export interface User {
  id: string;
  username: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  bio?: string | null;
  profileImageUrl?: string | null;
  name?: string;
  plan?: string;
  initials?: string;
}

export function useAuth() {
  // Try both API endpoints to ensure we catch responses from either
  const { data: authUser, isLoading: isLoadingAuth } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: true,
  });
  
  const { data: standardUser, isLoading: isLoadingUser } = useQuery<User | null>({
    queryKey: ["/api/user"],
    retry: false,
    enabled: true,
  });
  
  // Use whichever user data is available
  const user = authUser || standardUser;
  const isLoading = isLoadingAuth || isLoadingUser;

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}