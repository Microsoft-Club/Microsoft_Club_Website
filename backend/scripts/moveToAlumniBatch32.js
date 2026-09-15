const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Finding current Executive Council members...');

  const currentEcMembers = await prisma.member.findMany({
    where: { isCurrent: true },
  });

  console.log(`Found ${currentEcMembers.length} current members.`);

  if (currentEcMembers.length === 0) {
    console.log('No current EC members found.');
    return;
  }

  // Update all current EC members to Alumni with tenure "Batch 32"
  const result = await prisma.member.updateMany({
    where: { isCurrent: true },
    data: {
      isCurrent: false,
      tenure: 'Batch 32',
    },
  });

  console.log(`Successfully moved ${result.count} members to Alumni (Batch 32)!`);
}

main()
  .catch((err) => {
    console.error('Error updating members:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
