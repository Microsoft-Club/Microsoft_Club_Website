const fs = require('fs');
const path = require('path');

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || 'e44f103c5d57187e69c033e53cb0ed50';
const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET || 'microsoft-club-giki';
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

if (!API_TOKEN) {
  console.error('ERROR: CLOUDFLARE_API_TOKEN environment variable is required.');
  console.error('Run:');
  console.error('  $env:CLOUDFLARE_API_TOKEN="your_token_here"');
  console.error('  node backend/scripts/upload_to_r2.js');
  process.exit(1);
}

const ROOT_DIR = path.resolve(__dirname, '../..');

async function uploadFile(localPath, objectKey) {
  const fileBuffer = fs.readFileSync(localPath);
  const ext = path.extname(localPath).toLowerCase();
  const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';

  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/r2/buckets/${BUCKET_NAME}/objects/${encodeURIComponent(objectKey)}`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': contentType,
    },
    body: fileBuffer,
  });

  const data = await res.json();
  if (data.success) {
    console.log(`[SUCCESS] ${objectKey} (${(fileBuffer.length / 1024).toFixed(1)} KB)`);
    return true;
  } else {
    console.error(`[FAILED] ${objectKey}:`, data.errors);
    return false;
  }
}

async function uploadFolder(relFolder, prefix) {
  const absDir = path.join(ROOT_DIR, relFolder);
  const files = fs.readdirSync(absDir);
  let ok = 0;
  for (const file of files) {
    const fullPath = path.join(absDir, file);
    if (fs.statSync(fullPath).isDirectory()) continue;
    const success = await uploadFile(fullPath, `${prefix}/${file}`);
    if (success) ok++;
  }
  return { total: files.length, ok };
}

async function main() {
  console.log(`=== Uploading to Cloudflare R2 Bucket: ${BUCKET_NAME} ===`);
  console.log(`Account ID: ${ACCOUNT_ID}\n`);

  console.log('--- Uploading Event Images ---');
  const eventRes = await uploadFolder('frontend/public/event', 'event');

  console.log('\n--- Uploading Member Images ---');
  const memberRes = await uploadFolder('frontend/public/members', 'members');

  console.log('\n=== Summary ===');
  console.log(`Events: ${eventRes.ok}/${eventRes.total} uploaded.`);
  console.log(`Members: ${memberRes.ok}/${memberRes.total} uploaded.`);
}

main().catch(console.error);
