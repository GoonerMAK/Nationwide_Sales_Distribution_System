"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCurrentUser, useLogout } from "@/lib/auth";

export default function Home() {
  const router = useRouter();
  const { data: user, isLoading, isError } = useCurrentUser();
  const logout = useLogout();

  useEffect(() => {
    if (!isLoading && isError) {
      router.replace("/login");
    }
  }, [isLoading, isError, router]);

  if (isLoading || isError) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">Nationwide Sales Distribution System</h1>
      <p className="text-sm text-muted-foreground">Signed in as {user?.email}</p>
      <Button
        variant="outline"
        onClick={async () => {
          await logout.mutateAsync();
          router.push("/login");
        }}
      >
        Log out
      </Button>
    </main>
  );
}
