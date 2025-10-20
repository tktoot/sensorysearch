// Analytics data structures and utilities for tracking event views and favorites

export interface EventAnalytics {
  eventId: string
  views: number
  favorites: number
  viewHistory: {
    timestamp: string
    userId?: string
  }[]
  favoriteHistory: {
    timestamp: string
    userId?: string
  }[]
}

export interface UserFavorite {
  eventId: string
  addedAt: string
}

export interface BusinessAnalytics {
  businessEmail: string
  events: {
    [eventId: string]: EventAnalytics
  }
  totalViews: number
  totalFavorites: number
}

// LocalStorage keys
const ANALYTICS_KEY = "calmseek_analytics"
const USER_FAVORITES_KEY = "calmseek_user_favorites"

// Get all analytics data
export function getAllAnalytics(): Record<string, BusinessAnalytics> {
  if (typeof window === "undefined") return {}
  const data = localStorage.getItem(ANALYTICS_KEY)
  return data ? JSON.parse(data) : {}
}

// Save analytics data
function saveAnalytics(data: Record<string, BusinessAnalytics>) {
  if (typeof window === "undefined") return
  localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data))
}

// Track event view
export function trackEventView(eventId: string, businessEmail: string, userId?: string) {
  const analytics = getAllAnalytics()

  if (!analytics[businessEmail]) {
    analytics[businessEmail] = {
      businessEmail,
      events: {},
      totalViews: 0,
      totalFavorites: 0,
    }
  }

  if (!analytics[businessEmail].events[eventId]) {
    analytics[businessEmail].events[eventId] = {
      eventId,
      views: 0,
      favorites: 0,
      viewHistory: [],
      favoriteHistory: [],
    }
  }

  analytics[businessEmail].events[eventId].views++
  analytics[businessEmail].events[eventId].viewHistory.push({
    timestamp: new Date().toISOString(),
    userId,
  })
  analytics[businessEmail].totalViews++

  saveAnalytics(analytics)
}

// Track event favorite
export function trackEventFavorite(eventId: string, businessEmail: string, userId?: string) {
  const analytics = getAllAnalytics()

  if (!analytics[businessEmail]) {
    analytics[businessEmail] = {
      businessEmail,
      events: {},
      totalViews: 0,
      totalFavorites: 0,
    }
  }

  if (!analytics[businessEmail].events[eventId]) {
    analytics[businessEmail].events[eventId] = {
      eventId,
      views: 0,
      favorites: 0,
      viewHistory: [],
      favoriteHistory: [],
    }
  }

  analytics[businessEmail].events[eventId].favorites++
  analytics[businessEmail].events[eventId].favoriteHistory.push({
    timestamp: new Date().toISOString(),
    userId,
  })
  analytics[businessEmail].totalFavorites++

  saveAnalytics(analytics)
}

// Remove event favorite
export function removeEventFavorite(eventId: string, businessEmail: string) {
  const analytics = getAllAnalytics()

  if (analytics[businessEmail]?.events[eventId]) {
    analytics[businessEmail].events[eventId].favorites = Math.max(
      0,
      analytics[businessEmail].events[eventId].favorites - 1,
    )
    analytics[businessEmail].totalFavorites = Math.max(0, analytics[businessEmail].totalFavorites - 1)
    saveAnalytics(analytics)
  }
}

// Get analytics for a specific business
export function getBusinessAnalytics(businessEmail: string): BusinessAnalytics | null {
  const analytics = getAllAnalytics()
  return analytics[businessEmail] || null
}

// Get analytics for a specific event
export function getEventAnalytics(eventId: string, businessEmail: string): EventAnalytics | null {
  const analytics = getAllAnalytics()
  return analytics[businessEmail]?.events[eventId] || null
}

// User favorites management
export function getUserFavorites(): UserFavorite[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(USER_FAVORITES_KEY)
  return data ? JSON.parse(data) : []
}

function saveUserFavorites(favorites: UserFavorite[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(USER_FAVORITES_KEY, JSON.stringify(favorites))
}

export function addUserFavorite(eventId: string, businessEmail: string): boolean {
  const favorites = getUserFavorites()

  // Check if already favorited
  if (favorites.some((f) => f.eventId === eventId)) {
    return false
  }

  favorites.push({
    eventId,
    addedAt: new Date().toISOString(),
  })

  saveUserFavorites(favorites)
  trackEventFavorite(eventId, businessEmail)
  return true
}

export function removeUserFavorite(eventId: string, businessEmail: string): boolean {
  const favorites = getUserFavorites()
  const filtered = favorites.filter((f) => f.eventId !== eventId)

  if (filtered.length === favorites.length) {
    return false // Wasn't favorited
  }

  saveUserFavorites(filtered)
  removeEventFavorite(eventId, businessEmail)
  return true
}

export function isEventFavorited(eventId: string): boolean {
  const favorites = getUserFavorites()
  return favorites.some((f) => f.eventId === eventId)
}

// Export analytics data as CSV
export function exportAnalyticsToCSV(businessEmail: string): string {
  const analytics = getBusinessAnalytics(businessEmail)
  if (!analytics) return ""

  const headers = ["Event ID", "Views", "Favorites", "Last Viewed", "Last Favorited"]
  const rows = Object.values(analytics.events).map((event) => {
    const lastView = event.viewHistory[event.viewHistory.length - 1]?.timestamp || "N/A"
    const lastFavorite = event.favoriteHistory[event.favoriteHistory.length - 1]?.timestamp || "N/A"
    return [event.eventId, event.views.toString(), event.favorites.toString(), lastView, lastFavorite]
  })

  const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
  return csv
}

// Download CSV file
export function downloadAnalyticsCSV(businessEmail: string, filename = "analytics.csv") {
  const csv = exportAnalyticsToCSV(businessEmail)
  const blob = new Blob([csv], { type: "text/csv" })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}
