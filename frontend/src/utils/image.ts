const R2_BASE_URL = (
  (import.meta.env.VITE_R2_PUBLIC_URL as string | undefined) ||
  'https://pub-2839c05f69c040768d61d9a74a3f536b.r2.dev'
).replace(/\/+$/, '');

/**
 * Resolves an image URL to either the Cloudflare R2 bucket CDN URL
 * or standard external/local URL.
 */
export const resolveImageUrl = (rawUrl?: string): string => {
  if (!rawUrl) return '';

  // Handle accidental quotes/backslashes from copied Windows-style paths
  const cleaned = rawUrl.trim().replace(/^['"]+|['"]+$/g, '').replace(/\\/g, '/');
  if (!cleaned) return '';

  if (/^https?:\/\//i.test(cleaned)) {
    try {
      const url = new URL(cleaned);
      // Clean up accidental /frontend/public/ in pathname
      url.pathname = url.pathname
        .replace(/\/(frontend\/)?public\//i, '/')
        .replace(/\/{2,}/g, '/');

      // If it's a legacy GitHub Pages URL (e.g. mak030504.github.io/Microsoft_Club_Website/event/...)
      const ghPagesMatch = url.hostname.match(/^[\w-]+\.github\.io$/i);
      if (ghPagesMatch) {
        // Strip repo prefix (e.g. /Microsoft_Club_Website)
        const pathAfterRepo = url.pathname.replace(/^\/[^/]+/, '');
        return `${R2_BASE_URL}${pathAfterRepo}`;
      }

      return url.toString();
    } catch {
      return cleaned;
    }
  }

  // Normalize local or relative paths
  const withoutPublicPrefix = cleaned.replace(/^\/?(frontend\/)?public\//i, '');
  const normalizedPath = withoutPublicPrefix.replace(/^\/+/, '');

  // If path starts with event/ or members/ or projects/, route to R2 CDN
  if (/^(event|members|projects)\//i.test(normalizedPath)) {
    return `${R2_BASE_URL}/${normalizedPath}`;
  }

  // Fallback to local BASE_URL for general static assets
  return `${import.meta.env.BASE_URL}${normalizedPath}`.replace(/([^:]\/)\/+/g, '$1');
};
