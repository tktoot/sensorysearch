// User utility functions for managing favorites and user data

export interface UserFavorite {
  eventId: string
  addedAt: string
}

export function getUserFavorites(): UserFavorite[] {
  try {
    const favorites = localStorage.getItem("userFavorites")
    if (!favorites) {
      return []
    }
    return JSON.parse(favorites)
  } catch (error) {
    console.error("[v0] Failed to parse user favorites", error)
    return []
  }
}

export function addUserFavorite(eventId: string): void {
  try {
    const favorites = getUserFavorites()
    const exists = favorites.some((f) => f.eventId === eventId)

    if (!exists) {
      favorites.push({
        eventId,
        addedAt: new Date().toISOString(),
      })
      localStorage.setItem("userFavorites", JSON.stringify(favorites))
    }
  } catch (error) {
    console.error("[v0] Failed to add favorite", error)
  }
}

export function removeUserFavorite(eventId: string): void {
  try {
    const favorites = getUserFavorites()
    const filtered = favorites.filter((f) => f.eventId !== eventId)
    localStorage.setItem("userFavorites", JSON.stringify(filtered))
  } catch (error) {
    console.error("[v0] Failed to remove favorite", error)
  }
}

export function isEventFavorited(eventId: string): boolean {
  try {
    const favorites = getUserFavorites()
    return favorites.some((f) => f.eventId === eventId)
  } catch (error) {
    console.error("[v0] Failed to check favorite status", error)
    return false
  }
}
