"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/lib/auth";

/** Redirects to /login when there's no authenticated session. Use in any page that requires one. */
export function useRequireAuth() {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();
  const isUnauthenticated = !isLoading && !user;

  useEffect(() => {
    if (isUnauthenticated) {
      router.replace("/login");
    }
  }, [isUnauthenticated, router]);

  return { user, isPending: isLoading || isUnauthenticated };
}
