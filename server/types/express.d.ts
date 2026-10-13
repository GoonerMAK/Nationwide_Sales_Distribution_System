import type { AuthSession, AuthUser } from '../src/auth.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      session?: AuthSession;
      requestId?: string;
    }
  }
}
