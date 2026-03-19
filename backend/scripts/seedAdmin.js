const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const plainPassword = process.env.ADMIN_PASSWORD;

  if (!email || !plainPassword) {
    throw new Error(
      'Missing ADMIN_EMAIL or ADMIN_PASSWORD. Set them in backend/.env before running seed:admin.'
    );
  }

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    console.log('Admin already exists with this email.');
    return;
  }

  const hashed = await bcrypt.hash(plainPassword, 10);

  await prisma.admin.create({
    data: {
      email,
      password: hashed,
    },
  });

  console.log('Admin user created successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

