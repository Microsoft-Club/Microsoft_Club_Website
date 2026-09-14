const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// 1. Load .env
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

// Prefer direct connection for migration script to avoid pooler transaction timeout/limits
if (process.env.DIRECT_URL) {
  process.env.DATABASE_URL = process.env.DIRECT_URL;
}

const prisma = require('../prisma/client');

// 2. Determine target base URL
const rawDomain = process.env.R2_PUBLIC_DOMAIN || 'https://pub-2839c05f69c040768d61d9a74a3f536b.r2.dev';
const R2_PUBLIC_DOMAIN = rawDomain.trim().replace(/\/+$/, '');

function getCleanBasename(urlStr) {
  try {
    const parsed = new URL(urlStr);
    return path.posix.basename(parsed.pathname);
  } catch {
    const clean = urlStr.split('?')[0].split('#')[0];
    return path.posix.basename(clean.replace(/\\/g, '/'));
  }
}

function transformMemberImage(image) {
  if (!image || typeof image !== 'string') return image;
  const trimmed = image.trim();
  if (!trimmed) return trimmed;

  if (trimmed.startsWith(R2_PUBLIC_DOMAIN)) {
    return trimmed;
  }

  if (
    trimmed.includes('mak030504.github.io/Microsoft_Club_Website/members/') ||
    trimmed.includes('/members/') ||
    trimmed.startsWith('members/')
  ) {
    const filename = getCleanBasename(trimmed);
    return `${R2_PUBLIC_DOMAIN}/members/${filename}`;
  }

  if (trimmed.includes('mak030504.github.io/Microsoft_Club_Website/')) {
    const folder = trimmed.includes('/event/') ? 'event' : 'members';
    const filename = getCleanBasename(trimmed);
    return `${R2_PUBLIC_DOMAIN}/${folder}/${filename}`;
  }

  return trimmed;
}

function transformEventImage(image) {
  if (!image || typeof image !== 'string') return image;
  const trimmed = image.trim();
  if (!trimmed) return trimmed;

  if (trimmed.startsWith(R2_PUBLIC_DOMAIN)) {
    return trimmed;
  }

  if (
    trimmed.includes('mak030504.github.io/Microsoft_Club_Website/') ||
    trimmed.includes('/event/') ||
    trimmed.includes('/members/') ||
    trimmed.startsWith('event/') ||
    trimmed.startsWith('members/')
  ) {
    let folder = 'event';
    if (trimmed.includes('/members/') || trimmed.startsWith('members/')) {
      folder = 'members';
    } else if (trimmed.includes('/event/') || trimmed.startsWith('event/')) {
      folder = 'event';
    }
    const filename = getCleanBasename(trimmed);
    return `${R2_PUBLIC_DOMAIN}/${folder}/${filename}`;
  }

  return trimmed;
}

function transformProjectImage(image) {
  if (!image || typeof image !== 'string') return image;
  const trimmed = image.trim();
  if (!trimmed) return trimmed;

  if (trimmed.startsWith(R2_PUBLIC_DOMAIN)) {
    return trimmed;
  }

  if (
    trimmed.includes('mak030504.github.io/Microsoft_Club_Website/') ||
    trimmed.includes('/event/') ||
    trimmed.includes('/members/') ||
    trimmed.includes('/projects/') ||
    trimmed.startsWith('projects/')
  ) {
    let folder = 'event';
    if (trimmed.includes('/members/') || trimmed.startsWith('members/')) {
      folder = 'members';
    } else if (trimmed.includes('/projects/') || trimmed.startsWith('projects/')) {
      folder = 'projects';
    }
    const filename = getCleanBasename(trimmed);
    return `${R2_PUBLIC_DOMAIN}/${folder}/${filename}`;
  }

  return trimmed;
}

async function retry(fn, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      console.warn(`[Retry ${i + 1}/${retries}] ${err.message}. Retrying in ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

async function main() {
  console.log('========================================================');
  console.log('       MIGRATE DATABASE IMAGE URLS TO CLOUDFLARE R2      ');
  console.log('========================================================');
  console.log(`Target R2 Public Domain: ${R2_PUBLIC_DOMAIN}`);
  console.log(`Env file loaded from:   ${envPath}\n`);

  // 3. Fetch all records
  console.log('Fetching current records from database...');
  const allEvents = await retry(() => prisma.event.findMany({ orderBy: { id: 'asc' } }));
  const allMembers = await retry(() => prisma.member.findMany({ orderBy: { id: 'asc' } }));
  const allProjects = await retry(() => prisma.project.findMany({ orderBy: { id: 'asc' } }));

  console.log(`Found:`);
  console.log(` - ${allMembers.length} Members`);
  console.log(` - ${allEvents.length} Events`);
  console.log(` - ${allProjects.length} Projects\n`);

  // 4. Create backup JSON
  const backupPath = path.resolve(__dirname, 'db_backup_before_r2_migration.json');
  fs.writeFileSync(
    backupPath,
    JSON.stringify({ events: allEvents, members: allMembers, projects: allProjects }, null, 2),
    'utf8'
  );
  console.log(`[Backup] Saved snapshot before migration to:\n  ${backupPath}\n`);

  // 5. Migrate Members
  console.log('--- Migrating Member Images ---');
  let membersUpdated = 0;
  const memberSamples = [];

  for (const m of allMembers) {
    if (!m.image) continue;
    const newImage = transformMemberImage(m.image);
    if (newImage !== m.image) {
      await retry(() =>
        prisma.member.update({
          where: { id: m.id },
          data: { image: newImage },
        })
      );
      membersUpdated++;
      if (memberSamples.length < 3) {
        memberSamples.push({ id: m.id, name: m.name, before: m.image, after: newImage });
      }
    }
  }
  console.log(`Updated ${membersUpdated} of ${allMembers.length} member records.\n`);

  // 6. Migrate Events
  console.log('--- Migrating Event Images ---');
  let eventsUpdated = 0;
  let totalEventImagesUpdated = 0;
  const eventSamples = [];

  for (const e of allEvents) {
    if (!e.images || e.images.length === 0) continue;
    let eventChanged = false;
    const newImages = e.images.map((img) => {
      const transformed = transformEventImage(img);
      if (transformed !== img) {
        eventChanged = true;
        totalEventImagesUpdated++;
      }
      return transformed;
    });

    if (eventChanged) {
      await retry(() =>
        prisma.event.update({
          where: { id: e.id },
          data: { images: newImages },
        })
      );
      eventsUpdated++;
      if (eventSamples.length < 3) {
        eventSamples.push({
          id: e.id,
          title: e.title,
          before: e.images[0],
          after: newImages[0],
        });
      }
    }
  }
  console.log(`Updated ${eventsUpdated} of ${allEvents.length} event records (${totalEventImagesUpdated} total images updated).\n`);

  // 7. Migrate Projects
  console.log('--- Checking Project Images ---');
  let projectsUpdated = 0;
  for (const p of allProjects) {
    if (!p.images || p.images.length === 0) continue;
    let projectChanged = false;
    const newImages = p.images.map((img) => {
      const transformed = transformProjectImage(img);
      if (transformed !== img) projectChanged = true;
      return transformed;
    });

    if (projectChanged) {
      await retry(() =>
        prisma.project.update({
          where: { id: p.id },
          data: { images: newImages },
        })
      );
      projectsUpdated++;
    }
  }
  console.log(`Updated ${projectsUpdated} of ${allProjects.length} project records.\n`);

  // 8. Print sample transformations
  console.log('=== Sample Transformations ===');
  console.log('Members:');
  memberSamples.forEach((s) => {
    console.log(` [#${s.id} ${s.name}]`);
    console.log(`   Before: ${s.before}`);
    console.log(`   After:  ${s.after}`);
  });

  console.log('\nEvents:');
  eventSamples.forEach((s) => {
    console.log(` [#${s.id} "${s.title}"]`);
    console.log(`   Before: ${s.before}`);
    console.log(`   After:  ${s.after}`);
  });

  // 9. Verification by reading back records
  console.log('\n=== Database State Verification ===');
  const verifyMembers = await retry(() =>
    prisma.member.findMany({
      where: { image: { not: null } },
      take: 5,
      orderBy: { id: 'asc' },
    })
  );
  console.log('Verified Member sample in DB:');
  verifyMembers.forEach((m) => console.log(` - Member #${m.id} (${m.name}):\n     ${m.image}`));

  const verifyEvents = await retry(() =>
    prisma.event.findMany({
      where: { images: { isEmpty: false } },
      take: 5,
      orderBy: { id: 'asc' },
    })
  );
  console.log('\nVerified Event sample in DB:');
  verifyEvents.forEach((e) => console.log(` - Event #${e.id} ("${e.title}"):\n     ${e.images[0]}`));

  // Audit: Check if any old URLs remain
  const remainingOldMembers = await retry(() =>
    prisma.member.findMany({
      where: { image: { contains: 'mak030504.github.io' } },
    })
  );
  const allEventsCheck = await retry(() => prisma.event.findMany());
  const remainingOldEvents = allEventsCheck.filter((e) =>
    (e.images || []).some((img) => img.includes('mak030504.github.io'))
  );

  console.log('\nVerification Audit:');
  console.log(` - Remaining member records with github.io URL: ${remainingOldMembers.length}`);
  console.log(` - Remaining event records with github.io URL:  ${remainingOldEvents.length}`);

  if (remainingOldMembers.length === 0 && remainingOldEvents.length === 0) {
    console.log('\n>>> SUCCESS: All targeted database image URLs have been migrated to Cloudflare R2! <<<');
  } else {
    console.warn('\n>>> WARNING: Some records still reference the old domain. <<<');
  }
}

main()
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
