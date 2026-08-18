/**
 * Validates a redirect URL to prevent open redirect vulnerabilities.
 * Only allows internal relative paths starting with '/'.
 * Rejects absolute URLs, protocol-relative URLs (//), and malformed strings.
 */
export function getSafeRedirect(url: string | null | undefined, fallback: string = "/dashboard"): string {
  if (!url || typeof url !== "string") {
    return fallback;
  }

  // Ensure it starts with '/' but not '//'
  if (url.startsWith("/") && !url.startsWith("//")) {
    return url;
  }

  return fallback;
}
