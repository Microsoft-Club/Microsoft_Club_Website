const fs = require('fs');
const path = require('path');
const prisma = require('../prisma/client');

const ROOT_DIR = path.resolve(__dirname, '../..');
const FRONTEND_DIR = path.join(ROOT_DIR, 'frontend');
const PUBLIC_DIR = path.join(FRONTEND_DIR, 'public');
const EVENT_DIR = path.join(PUBLIC_DIR, 'event');
const MEMBERS_DIR = path.join(PUBLIC_DIR, 'members');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/learning and development session:\s*/gi, 'lnd-')
    .replace(/learning and development:\s*/gi, 'lnd-')
    .replace(/online workshop:\s*/gi, 'workshop-')
    .replace(/session:\s*/gi, '')
    .replace(/emerse:\s*/gi, 'emerse-')
    .replace(/emserse:\s*/gi, 'emerse-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function run() {
  console.log('=== Step 1: Backup current database data ===');
  const allEvents = await prisma.event.findMany();
  const allMembers = await prisma.member.findMany();

  const backupFile = path.join(__dirname, 'db_backup_before_rename.json');
  fs.writeFileSync(backupFile, JSON.stringify({ events: allEvents, members: allMembers }, null, 2));
  console.log(`Saved backup to ${backupFile}`);

  console.log('\n=== Step 2: Plan file operations ===');
  
  // 1. Members
  const memberFileOps = [];
  const memberDbUpdates = [];

  for (const m of allMembers) {
    if (!m.image) continue;
    const nameSlug = slugify(m.name);
    const roleSlug = slugify(m.role);
    const tenureSlug = slugify(m.tenure || '25-26');
    const ext = m.image.endsWith('.png') ? '.png' : '.jpeg';
    const newFilename = `${nameSlug}-${roleSlug}-${tenureSlug}${ext}`;
    const oldFilename = path.basename(m.image);

    const oldPath = path.join(MEMBERS_DIR, oldFilename);
    const newPath = path.join(MEMBERS_DIR, newFilename);
    const newUrl = `https://mak030504.github.io/Microsoft_Club_Website/members/${newFilename}`;

    memberFileOps.push({ oldPath, newPath, oldFilename, newFilename });
    memberDbUpdates.push({ id: m.id, name: m.name, newImage: newUrl });
  }

  // 2. Events
  const eventFileOps = [];
  const eventDbUpdates = [];

  for (const e of allEvents) {
    if (!e.images || e.images.length === 0) continue;
    const dateStr = e.date ? new Date(e.date).toISOString().split('T')[0] : 'undated';
    const slug = slugify(e.title);
    const total = e.images.length;
    const newImages = [];

    e.images.forEach((imgUrl, idx) => {
      const ext = imgUrl.endsWith('.png') ? '.png' : '.jpeg';
      const numSuffix = total > 1 ? `-${idx + 1}` : '';
      const newFilename = `${slug}-${dateStr}${numSuffix}${ext}`;
      const newUrl = `https://mak030504.github.io/Microsoft_Club_Website/event/${newFilename}`;
      newImages.push(newUrl);

      let oldFilename = path.basename(imgUrl);
      let isMembersFolder = imgUrl.includes('/members/');

      // Handle typo in Event 6 where DB had 6_4.jpeg but file is 6_3.jpeg
      if (e.id === 6 && oldFilename === '6_4.jpeg') {
        oldFilename = '6_3.jpeg';
      }

      const sourceDir = isMembersFolder ? MEMBERS_DIR : EVENT_DIR;
      const oldPath = path.join(sourceDir, oldFilename);
      const newPath = path.join(EVENT_DIR, newFilename);
      // Also copy to members if it was originally in members
      const backwardCompatPath = isMembersFolder ? path.join(MEMBERS_DIR, newFilename) : null;

      eventFileOps.push({
        oldPath,
        newPath,
        backwardCompatPath,
        oldFilename,
        newFilename,
        isMembersFolder
      });
    });

    eventDbUpdates.push({
      id: e.id,
      title: e.title,
      newImages
    });
  }

  console.log(`Planned ${memberFileOps.length} member file operations.`);
  console.log(`Planned ${eventFileOps.length} event file operations.`);

  console.log('\n=== Step 3: Execute file operations on disk ===');
  // Copy all files to their new destinations first
  for (const op of memberFileOps) {
    if (fs.existsSync(op.oldPath)) {
      fs.copyFileSync(op.oldPath, op.newPath);
      console.log(`[Member] Copied ${op.oldFilename} -> ${op.newFilename}`);
    } else {
      console.warn(`[Member] WARNING: Source file missing: ${op.oldPath}`);
    }
  }

  for (const op of eventFileOps) {
    if (fs.existsSync(op.oldPath)) {
      fs.copyFileSync(op.oldPath, op.newPath);
      console.log(`[Event] Copied ${op.oldFilename} -> event/${op.newFilename}`);
      if (op.backwardCompatPath) {
        fs.copyFileSync(op.oldPath, op.backwardCompatPath);
        console.log(`[Event Backward Compat] Also copied to members/${op.newFilename}`);
      }
    } else {
      console.warn(`[Event] WARNING: Source file missing: ${op.oldPath}`);
    }
  }

  // Delete old numerical files from event and members
  console.log('\n=== Step 4: Clean up old files ===');
  const filesToDelete = new Set();
  memberFileOps.forEach(op => {
    if (op.oldPath !== op.newPath) filesToDelete.add(op.oldPath);
  });
  eventFileOps.forEach(op => {
    if (op.oldPath !== op.newPath && op.oldPath !== op.backwardCompatPath) filesToDelete.add(op.oldPath);
  });
  // Also delete 14_@.jpeg duplicate
  const dupPath = path.join(EVENT_DIR, '14_@.jpeg');
  if (fs.existsSync(dupPath)) {
    filesToDelete.add(dupPath);
  }

  for (const f of filesToDelete) {
    if (fs.existsSync(f)) {
      fs.unlinkSync(f);
      console.log(`Deleted old file: ${path.relative(PUBLIC_DIR, f)}`);
    }
  }

  console.log('\n=== Step 5: Update database records ===');
  for (const m of memberDbUpdates) {
    await prisma.member.update({
      where: { id: m.id },
      data: { image: m.newImage }
    });
    console.log(`Updated Member #${m.id} (${m.name}): image = ${m.newImage}`);
  }

  for (const e of eventDbUpdates) {
    await prisma.event.update({
      where: { id: e.id },
      data: { images: e.newImages }
    });
    console.log(`Updated Event #${e.id} ("${e.title}"): ${e.newImages.length} images`);
  }

  console.log('\n=== Step 6: Verification ===');
  let missingCount = 0;
  const verifyEvents = await prisma.event.findMany();
  for (const e of verifyEvents) {
    for (const imgUrl of e.images) {
      const filename = path.basename(imgUrl);
      const filePath = path.join(EVENT_DIR, filename);
      if (!fs.existsSync(filePath)) {
        console.error(`ERROR: File missing for event #${e.id}: ${filePath}`);
        missingCount++;
      }
    }
  }

  const verifyMembers = await prisma.member.findMany();
  for (const m of verifyMembers) {
    if (m.image) {
      const filename = path.basename(m.image);
      const filePath = path.join(MEMBERS_DIR, filename);
      if (!fs.existsSync(filePath)) {
        console.error(`ERROR: File missing for member #${m.id}: ${filePath}`);
        missingCount++;
      }
    }
  }

  if (missingCount === 0) {
    console.log('SUCCESS: All database image URLs verified to exist on disk!');
  } else {
    console.error(`FAILURE: ${missingCount} missing files!`);
  }
}

run()
  .catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
