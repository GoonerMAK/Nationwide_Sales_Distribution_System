import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

/**
 * Better Auth client pointed at the Express API (`/api/auth/*`), not the Next.js origin.
 * Requests are cross-origin and carry the session cookie automatically.
 */
export const authClient = createAuthClient({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/auth`,
  plugins: [adminClient()],
});
