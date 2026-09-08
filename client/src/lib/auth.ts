import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./api";

export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export const authUserQueryKey = ["auth", "user"] as const;

/** Fetches the currently authenticated user from the JWT cookie. */
export function useCurrentUser() {
  return useQuery({
    queryKey: authUserQueryKey,
    queryFn: async () => {
      const { user } = await apiFetch<{ user: AuthUser }>("/auth/user");
      return user;
    },
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      apiFetch<{ user: AuthUser; token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),
    onSuccess: ({ user }) => {
      queryClient.setQueryData(authUserQueryKey, user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiFetch("/auth/logout", { method: "POST" }),
    onSuccess: () => {
      queryClient.setQueryData(authUserQueryKey, null);
    },
  });
}
