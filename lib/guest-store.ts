/**
 * Guest Store - localStorage-based storage for unauthenticated users
 * Stores favorites, radius, age settings, and other preferences
 */

export interface GuestProfile {
  radiusMiles?: number
  homeZip?: string
  ageFocus?: "toddler" | "child" | "teen" | "adult" | "all"
  favorites: string[] // event/venue IDs
  createdAt: string
}

const GUEST_STORE_KEY = "sensory_search_guest_profile"

export function getGuestProfile(): GuestProfile | null {
  if (typeof window === "undefined") return null

  try {
    const stored = localStorage.getItem(GUEST_STORE_KEY)
    if (!stored) return null
    return JSON.parse(stored)
  } catch (error) {
    console.error("[v0] Failed to load guest profile:", error)
    return null
  }
}

export function saveGuestProfile(profile: Partial<GuestProfile>): void {
  if (typeof window === "undefined") return

  try {
    const existing = getGuestProfile() || {
      favorites: [],
      createdAt: new Date().toISOString(),
    }

    const updated = { ...existing, ...profile }
    localStorage.setItem(GUEST_STORE_KEY, JSON.stringify(updated))
    console.log("[v0] Guest profile saved:", updated)
  } catch (error) {
    console.error("[v0] Failed to save guest profile:", error)
  }
}

export function clearGuestProfile(): void {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(GUEST_STORE_KEY)
    console.log("[v0] Guest profile cleared")
  } catch (error) {
    console.error("[v0] Failed to clear guest profile:", error)
  }
}

export function toggleGuestFavorite(listingId: string): void {
  const profile = getGuestProfile() || { favorites: [], createdAt: new Date().toISOString() }

  const favorites = profile.favorites.includes(listingId)
    ? profile.favorites.filter((id) => id !== listingId)
    : [...profile.favorites, listingId]

  saveGuestProfile({ ...profile, favorites })
}

export function isGuestFavorite(listingId: string): boolean {
  const profile = getGuestProfile()
  return profile?.favorites.includes(listingId) ?? false
}

export function getGuestFavorites(): string[] {
  const profile = getGuestProfile()
  return profile?.favorites || []
}
