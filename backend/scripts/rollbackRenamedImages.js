const fs = require('fs');
const path = require('path');
const prisma = require('../prisma/client');

async function rollback() {
  const backupFile = path.join(__dirname, 'db_backup_before_rename.json');
  if (!fs.existsSync(backupFile)) {
    console.error('Backup file not found:', backupFile);
    process.exit(1);
  }

  const backup = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
  console.log('Restoring events...');
  for (const e of backup.events) {
    await prisma.event.update({
      where: { id: e.id },
      data: { images: e.images }
    });
  }

  console.log('Restoring members...');
  for (const m of backup.members) {
    await prisma.member.update({
      where: { id: m.id },
      data: { image: m.image }
    });
  }

  console.log('Database rollback complete.');
}

if (require.main === module) {
  rollback()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}

module.exports = rollback;
