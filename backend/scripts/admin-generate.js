const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const plainPassword = process.env.ADMIN_PASSWORD;

  if (!email || !plainPassword) {
    throw new Error(
      'Missing ADMIN_EMAIL or ADMIN_PASSWORD. Set them in backend/.env before running admin-generate.'
    );
  }

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    console.log('Admin already exists with this email.');
    return;
  }

  // Optional: ADMIN_ROLE = Logikal | Marketing | Inductions | Dev | General (default General)
  const role = process.env.ADMIN_ROLE || 'General';
  const validRoles = ['Logikal', 'Marketing', 'Inductions', 'Dev', 'General'];
  if (!validRoles.includes(role)) {
    throw new Error(`Invalid ADMIN_ROLE "${role}". Use one of: ${validRoles.join(', ')}`);
  }

  const hashed = await bcrypt.hash(plainPassword, 10);

  const admin = await prisma.admin.create({
    data: {
      email,
      password: hashed,
      role,
    },
  });

  console.log(`Admin user created successfully with role: ${admin.role}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
