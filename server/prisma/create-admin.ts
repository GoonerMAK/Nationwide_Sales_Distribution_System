import prisma from '../src/prisma.js';
import { auth } from '../src/auth.js';

/**
 * Bootstraps the first admin account. Public sign-up is disabled, so without this
 * nobody could log in to create other users. Reads ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD
 * from server/.env; if the email already exists, the user is promoted to admin instead.
 */
async function main() {
  const name = process.env.ADMIN_NAME ?? 'Admin';
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in server/.env');
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({ where: { id: existing.id }, data: { role: 'admin' } });
    console.log(`✓ ${email} already exists, promoted to admin`);
    return;
  }

  // No request headers: server-side calls bypass the admin plugin's session check.
  await auth.api.createUser({ body: { name, email, password, role: 'admin' } });
  console.log(`✓ Created admin ${email}`);
}

main()
  .catch((e) => {
    console.error('❌ Failed to create admin:', e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
