export function getFaviconUrls(entryType, primaryUrl) {
  if (entryType !== "http" || !primaryUrl) return [];

  try {
    const url = new URL(primaryUrl);
    const origin = url.origin;
    const proxyUrl = `/api/favicon?url=${encodeURIComponent(primaryUrl)}`;
    return [proxyUrl, `${origin}/favicon.ico`, `${origin}/favicon.svg`, `${origin}/favicon.png`];
  } catch {
    return [];
  }
}
