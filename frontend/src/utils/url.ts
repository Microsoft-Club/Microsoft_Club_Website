const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);

export const safeExternalUrl = (raw?: string | null): string | undefined => {
  if (!raw) return undefined;
  try {
    const url = new URL(raw.trim());
    return SAFE_PROTOCOLS.has(url.protocol) ? url.toString() : undefined;
  } catch {
    return undefined;
  }
};
