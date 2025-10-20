/**
 * Normalize and validate URL
 * Accepts bare domains like "example.com" and adds https:// if missing
 */
export function normalizeUrl(url: string): string {
  if (!url) return ""

  // Trim whitespace
  url = url.trim()

  // If no protocol, add https://
  if (!url.match(/^https?:\/\//i)) {
    url = `https://${url}`
  }

  return url
}

/**
 * Validate URL format
 * Returns true if URL is valid or empty (optional field)
 */
export function isValidUrl(url: string): boolean {
  if (!url || url.trim() === "") return true // Optional field

  try {
    const normalized = normalizeUrl(url)
    const urlObj = new URL(normalized)
    // Must have a valid host with at least one dot
    return urlObj.hostname.includes(".")
  } catch {
    return false
  }
}
