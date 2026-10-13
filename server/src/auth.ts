import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins';
import prisma from './prisma.js';
import { env } from './config/env.js';

/**
 * Better Auth instance. Mounted at /api/auth/* in index.ts and used by the auth middleware.
 *
 * Sessions are opaque tokens stored in the Session table (no JWTs), so logout, bans and
 * password changes revoke access immediately.
 *
 * Our Prisma schema uses snake_case columns, while Better Auth uses camelCase field names,
 * so every non-trivial field is mapped below. Keep this in sync with prisma/schema.prisma.
 */
export const auth = betterAuth({
  basePath: '/api/auth',
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: env.CORS_ORIGINS,

  database: prismaAdapter(prisma, { provider: 'postgresql' }),

  emailAndPassword: {
    enabled: true,
    // Internal system: accounts are created by admins only (POST /api/user or the admin plugin).
    disableSignUp: true,
    minPasswordLength: 8,
    revokeSessionsOnPasswordReset: true,
  },

  user: {
    fields: {
      emailVerified: 'email_verified',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
  session: {
    fields: {
      expiresAt: 'expires_at',
      ipAddress: 'ip_address',
      userAgent: 'user_agent',
      userId: 'user_id',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
  account: {
    fields: {
      accountId: 'account_id',
      providerId: 'provider_id',
      userId: 'user_id',
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
      idToken: 'id_token',
      accessTokenExpiresAt: 'access_token_expires_at',
      refreshTokenExpiresAt: 'refresh_token_expires_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
  verification: {
    fields: {
      expiresAt: 'expires_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },

  plugins: [
    admin({
      schema: {
        user: { fields: { banReason: 'ban_reason', banExpires: 'ban_expires' } },
        session: { fields: { impersonatedBy: 'impersonated_by' } },
      },
    }),
  ],

  advanced: {
    // Existing IDs are UUIDs and route params are validated as UUIDs.
    database: { generateId: 'uuid' },
    useSecureCookies: env.isProd,
  },
});

export type AuthUser = typeof auth.$Infer.Session.user;
export type AuthSession = typeof auth.$Infer.Session.session;
