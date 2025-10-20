import { type NextRequest, NextResponse } from "next/server"
import { getGuestProfile, saveGuestProfile } from "@/lib/guest-store"

export async function POST(request: NextRequest) {
  try {
    const { listingId } = await request.json()

    if (!listingId) {
      return NextResponse.json({ error: "listingId is required" }, { status: 400 })
    }

    // Get current guest profile
    const profile = getGuestProfile() || { favorites: [], createdAt: new Date().toISOString() }

    // Toggle favorite
    const isFavorite = profile.favorites.includes(listingId)
    const favorites = isFavorite
      ? profile.favorites.filter((id) => id !== listingId)
      : [...profile.favorites, listingId]

    // Remove duplicates
    const uniqueFavorites = Array.from(new Set(favorites))

    // Save updated profile
    saveGuestProfile({ ...profile, favorites: uniqueFavorites })

    return NextResponse.json({
      ok: true,
      isFavorite: !isFavorite,
      favoritesCount: uniqueFavorites.length,
    })
  } catch (error) {
    console.error("[v0] Failed to toggle favorite:", error)
    return NextResponse.json({ error: "Failed to toggle favorite" }, { status: 500 })
  }
}
