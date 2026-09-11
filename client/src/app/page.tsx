"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useLogout } from "@/lib/auth";

export default function Home() {
  const router = useRouter();
  const { user, isPending } = useRequireAuth();
  const logout = useLogout();

  if (isPending) {
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
        disabled={logout.isPending}
        onClick={async () => {
          await logout.mutateAsync();
          router.push("/login");
        }}
      >
        {logout.isPending ? "Logging out…" : "Log out"}
      </Button>
    </main>
  );
}
