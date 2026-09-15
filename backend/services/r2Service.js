const path = require('path');
const fs = require('fs');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// Cloudflare R2 & Storage Configuration
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

const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID?.trim();
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY?.trim();
const CLOUDFLARE_API_TOKEN = (
  process.env.CLOUDFLARE_API_TOKEN ||
  process.env.R2_API_TOKEN
)?.trim();

/**
 * Creates a clean URL-friendly kebab-case slug from a string.
 */
function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Uploads a file buffer to Cloudflare R2 bucket.
 * 
 * Supports:
 * 1. AWS S3 SDK (via R2_ACCESS_KEY_ID & R2_SECRET_ACCESS_KEY)
 * 2. Cloudflare REST API (via CLOUDFLARE_API_TOKEN)
 * 3. Graceful Local Fallback (if credentials are not yet configured in .env)
 * 
 * @param {Buffer} buffer - The file data
 * @param {string} originalName - Original filename or desired identifier
 * @param {string} mimeType - e.g. 'image/jpeg', 'image/png', 'image/webp'
 * @param {string} folder - 'members' or 'events'
 * @param {string} [customBaseName] - Optional member/event name to slugify in filename
 * @returns {Promise<{ url: string, key: string, size: number, storage: string }>}
 */
async function uploadBufferToR2(buffer, originalName, mimeType, folder = 'members', customBaseName = '') {
  const ext = (path.extname(originalName || '') || (mimeType === 'image/png' ? '.png' : mimeType === 'image/webp' ? '.webp' : '.jpeg')).toLowerCase();
  
  const baseSlug = customBaseName ? slugify(customBaseName) : slugify(path.basename(originalName || 'member', ext));
  const cleanKey = `${folder}/${baseSlug || 'member'}-${Date.now()}${ext}`;

  // 1. Try AWS S3 Client for Cloudflare R2
  if (ACCESS_KEY_ID && SECRET_ACCESS_KEY) {
    try {
      const s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: ACCESS_KEY_ID,
          secretAccessKey: SECRET_ACCESS_KEY,
        },
      });

      await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: cleanKey,
          Body: buffer,
          ContentType: mimeType || 'image/jpeg',
        })
      );

      const url = `${R2_PUBLIC_DOMAIN}/${cleanKey}`;
      console.log(`[R2 S3] Uploaded: ${cleanKey} (${(buffer.length / 1024).toFixed(1)} KB) -> ${url}`);
      return {
        url,
        key: cleanKey,
        size: buffer.length,
        storage: 'r2-s3',
      };
    } catch (err) {
      console.error('[R2 S3] Error uploading via S3 client:', err.message);
      // Fall through to REST or local fallback
    }
  }

  // 2. Try Cloudflare REST API
  if (CLOUDFLARE_API_TOKEN) {
    try {
      const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/r2/buckets/${BUCKET_NAME}/objects/${encodeURIComponent(cleanKey)}`;
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Content-Type': mimeType || 'image/jpeg',
        },
        body: buffer,
      });

      const data = await res.json();
      if (data.success) {
        const publicUrl = `${R2_PUBLIC_DOMAIN}/${cleanKey}`;
        console.log(`[R2 REST] Uploaded: ${cleanKey} (${(buffer.length / 1024).toFixed(1)} KB) -> ${publicUrl}`);
        return {
          url: publicUrl,
          key: cleanKey,
          size: buffer.length,
          storage: 'r2-rest',
        };
      } else {
        console.error('[R2 REST] Upload error:', data.errors);
      }
    } catch (err) {
      console.error('[R2 REST] Error uploading via REST API:', err.message);
    }
  }

  // 3. Fallback: Save locally if no R2 credentials are configured
  console.warn(
    '[R2 Warning] Cloudflare R2 credentials (R2_ACCESS_KEY_ID/R2_SECRET_ACCESS_KEY or CLOUDFLARE_API_TOKEN) ' +
    'not configured in backend/.env. Saving file to local storage directory as fallback.'
  );

  const localDir = path.resolve(__dirname, `../uploads/${folder}`);
  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir, { recursive: true });
  }

  const localFileName = path.basename(cleanKey);
  const localFilePath = path.join(localDir, localFileName);
  fs.writeFileSync(localFilePath, buffer);

  // Return public R2 URL format so DB stays clean, or local fallback URL
  // If in local development, it will route through public CDN or local static
  const publicUrl = `${R2_PUBLIC_DOMAIN}/${cleanKey}`;
  console.log(`[Local Fallback] Saved locally to ${localFilePath} (mapped to ${publicUrl})`);

  return {
    url: publicUrl,
    key: cleanKey,
    size: buffer.length,
    storage: 'local-fallback',
  };
}

module.exports = {
  uploadBufferToR2,
  ACCOUNT_ID,
  BUCKET_NAME,
  R2_PUBLIC_DOMAIN,
};
