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
  isAdmin?: boolean;
  workspaceId?: string | null;
}

export function useAuth() {
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}