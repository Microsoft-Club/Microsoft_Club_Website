const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from backend/.env
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const ACCOUNT_ID = (
  process.env.R2_ACCOUNT_ID ||
  process.env.CLOUDFLARE_ACCOUNT_ID ||
  'e44f103c5d57187e69c033e53cb0ed50'
).trim();

const BUCKET_NAME = (
  process.env.R2_BUCKET_NAME ||
  process.env.CLOUDFLARE_R2_BUCKET ||
  'microsoft-club-giki'
).trim();

const R2_PUBLIC_DOMAIN = (
  process.env.R2_PUBLIC_DOMAIN ||
  'https://pub-2839c05f69c040768d61d9a74a3f536b.r2.dev'
)
  .trim()
  .replace(/\/+$/, '');

const API_TOKEN = (process.env.CLOUDFLARE_API_TOKEN || process.env.R2_API_TOKEN)?.trim();
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID?.trim();
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY?.trim();

const ROOT_DIR = path.resolve(__dirname, '../..');

const hasS3Auth = Boolean(ACCESS_KEY_ID && SECRET_ACCESS_KEY);
const hasRestAuth = Boolean(API_TOKEN);

if (!hasS3Auth && !hasRestAuth) {
  console.error('\n================================================================');
  console.error('❌ ERROR: Cloudflare R2 credentials not found.');
  console.error('================================================================');
  console.error('To upload to the R2 bucket, please provide ONE of the following:\n');
  console.error('Option A: Cloudflare API Token (Recommended)');
  console.error('  1. Go to: https://dash.cloudflare.com/profile/api-tokens');
  console.error('  2. Create Token -> Custom Token');
  console.error('  3. Permissions: Account -> Workers R2 Storage -> Edit');
  console.error('  4. Set in backend/.env:');
  console.error('     CLOUDFLARE_API_TOKEN="your_token_here"');
  console.error('     or in PowerShell: $env:CLOUDFLARE_API_TOKEN="your_token_here"\n');
  console.error('Option B: R2 S3 Access Keys');
  console.error('  1. Go to: Cloudflare Dashboard -> R2 -> Manage R2 API Tokens');
  console.error('  2. Create Token with "Object Read & Write" permission');
  console.error('  3. Set in backend/.env:');
  console.error('     R2_ACCESS_KEY_ID="your_access_key_id"');
  console.error('     R2_SECRET_ACCESS_KEY="your_secret_access_key"');
  console.error('================================================================\n');
  process.exit(1);
}

// Upload a single file using either S3 client or Cloudflare REST API
async function uploadFile(localPath, objectKey) {
  const fileBuffer = fs.readFileSync(localPath);
  const ext = path.extname(localPath).toLowerCase();
  const contentType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';

  // 1. S3 API Upload
  if (hasS3Auth) {
    try {
      const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
      const s3 = new S3Client({
        region: 'auto',
        endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: ACCESS_KEY_ID,
          secretAccessKey: SECRET_ACCESS_KEY,
        },
      });

      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: objectKey,
          Body: fileBuffer,
          ContentType: contentType,
        })
      );

      console.log(`[SUCCESS S3] ${objectKey} (${(fileBuffer.length / 1024).toFixed(1)} KB) -> ${R2_PUBLIC_DOMAIN}/${objectKey}`);
      return true;
    } catch (err) {
      console.error(`[FAILED S3] ${objectKey}:`, err.message);
      if (!hasRestAuth) return false;
    }
  }

  // 2. Cloudflare REST API Upload
  if (hasRestAuth) {
    try {
      const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/r2/buckets/${BUCKET_NAME}/objects/${encodeURIComponent(objectKey)}`;
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          'Content-Type': contentType,
        },
        body: fileBuffer,
      });

      const data = await res.json();
      if (data.success) {
        console.log(`[SUCCESS REST] ${objectKey} (${(fileBuffer.length / 1024).toFixed(1)} KB) -> ${R2_PUBLIC_DOMAIN}/${objectKey}`);
        return true;
      } else {
        console.error(`[FAILED REST] ${objectKey}:`, data.errors);
        return false;
      }
    } catch (err) {
      console.error(`[FAILED REST] ${objectKey}:`, err.message);
      return false;
    }
  }

  return false;
}

async function uploadFolder(relFolder, prefix) {
  const absDir = path.join(ROOT_DIR, relFolder);
  if (!fs.existsSync(absDir)) {
    console.log(`[SKIP] Directory "${relFolder}" does not exist.`);
    return { total: 0, ok: 0 };
  }

  const files = fs.readdirSync(absDir);
  let ok = 0;
  let total = 0;

  for (const file of files) {
    const fullPath = path.join(absDir, file);
    if (fs.statSync(fullPath).isDirectory()) continue;
    total++;
    const success = await uploadFile(fullPath, `${prefix}/${file}`);
    if (success) ok++;
  }
  return { total, ok };
}

async function main() {
  console.log(`=== Uploading to Cloudflare R2 Bucket: ${BUCKET_NAME} ===`);
  console.log(`Account ID: ${ACCOUNT_ID}`);
  console.log(`Auth Method: ${hasS3Auth ? 'S3 API' : 'Cloudflare REST API'}`);
  console.log(`Public CDN: ${R2_PUBLIC_DOMAIN}\n`);

  console.log('--- Uploading Member Images (frontend/public/members) ---');
  const memberRes = await uploadFolder('frontend/public/members', 'members');

  if (fs.existsSync(path.join(ROOT_DIR, 'frontend/public/event'))) {
    console.log('\n--- Uploading Event Images (frontend/public/event) ---');
    const eventRes = await uploadFolder('frontend/public/event', 'event');
    console.log(`Events: ${eventRes.ok}/${eventRes.total} uploaded.`);
  }

  console.log('\n=== Summary ===');
  console.log(`Members: ${memberRes.ok}/${memberRes.total} uploaded.`);

  if (memberRes.ok > 0) {
    console.log('\nUploaded URLs:');
    const absDir = path.join(ROOT_DIR, 'frontend/public/members');
    fs.readdirSync(absDir).forEach((f) => {
      console.log(` - ${R2_PUBLIC_DOMAIN}/members/${f}`);
    });
  }
}

main().catch(console.error);
