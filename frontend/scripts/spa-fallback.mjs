import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const indexHtml = join(dist, 'index.html');

if (!existsSync(indexHtml)) {
  console.error('spa-fallback: dist/index.html not found. Run vite build first.');
  process.exit(1);
}

// Known client-side routes that Google/crawlers may request directly.
// Each path gets a real folder + index.html so GitHub Pages returns HTTP 200.
const routes = [
  'events',
  'members',
  'projects',
  'podcasts',
  'blogs',
  'inductions',
  'waiting-list',
  'inductions-waiting-list',
  'admin',
  'admin/login',
  'admin/dashboard',
];

for (const route of routes) {
  const targetDir = join(dist, route);
  mkdirSync(targetDir, { recursive: true });
  copyFileSync(indexHtml, join(targetDir, 'index.html'));
  console.log(`spa-fallback: ${route}/index.html`);
}

// Keep deep links (/events/:id, /blogs/:id) working in browsers.
// Note: GitHub Pages still serves this with status 404 for unknown paths.
copyFileSync(indexHtml, join(dist, '404.html'));
console.log('spa-fallback: 404.html <- index.html');
