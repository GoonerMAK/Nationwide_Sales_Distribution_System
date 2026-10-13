import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "./api";
import { authClient } from "./auth-client";

export type AuthUser = typeof authClient.$Infer.Session.user;

export const authUserQueryKey = ["auth", "user"] as const;

/** Better Auth calls resolve to `{ data, error }` instead of throwing; this turns errors into ApiError for React Query. */
async function unwrap<T>(
  call: Promise<{
    data: T | null;
    error: { message?: string; status: number; statusText: string } | null;
  }>,
): Promise<T | null> {
  const { data, error } = await call;
  if (error) {
    throw new ApiError(error.message ?? error.statusText, error.status);
  }
  return data;
}

/** Fetches the current session's user, or null when signed out. */
export function useCurrentUser() {
  return useQuery({
    queryKey: authUserQueryKey,
    queryFn: async () => {
      const session = await unwrap(authClient.getSession());
      return session?.user ?? null;
    },
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      unwrap(authClient.signIn.email(credentials)),
    // Refetch the full session (includes admin-plugin fields like role) rather than trusting the sign-in payload.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: authUserQueryKey }),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => unwrap(authClient.signOut()),
    onSuccess: () => {
      queryClient.setQueryData(authUserQueryKey, null);
    },
  });
}
