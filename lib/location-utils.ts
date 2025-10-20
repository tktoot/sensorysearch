export interface LocationData {
  lat: number
  lng: number
  city?: string
  zipCode?: string
  address?: string
}

export interface LocationPreferences {
  location: LocationData | null
  radius: number // in miles
  useCurrentLocation: boolean
}

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  unit: "miles" | "km" = "miles",
): number {
  const R = unit === "miles" ? 3959 : 6371 // Earth's radius in miles or km
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return Math.round(distance * 10) / 10 // Round to 1 decimal place
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180
}

// Get user's current location using browser geolocation API
export async function getCurrentLocation(): Promise<LocationData> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"))
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location: LocationData = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }

        // Try to reverse geocode to get city name
        try {
          const cityName = await reverseGeocode(location.lat, location.lng)
          location.city = cityName
        } catch (error) {
          console.warn("[v0] Failed to reverse geocode location", error)
        }

        resolve(location)
      },
      (error) => {
        reject(new Error(`Failed to get location: ${error.message}`))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      },
    )
  })
}

// Reverse geocode coordinates to city name using Nominatim (OpenStreetMap)
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
      {
        headers: {
          "User-Agent": "CalmSeek/1.0",
        },
      },
    )

    if (!response.ok) {
      throw new Error("Geocoding failed")
    }

    const data = await response.json()
    return data.address?.city || data.address?.town || data.address?.village || "Unknown Location"
  } catch (error) {
    console.error("[v0] Reverse geocoding error:", error)
    return "Unknown Location"
  }
}

// Forward geocode city/ZIP to coordinates using Nominatim
export async function geocodeLocation(query: string): Promise<LocationData | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      {
        headers: {
          "User-Agent": "CalmSeek/1.0",
        },
      },
    )

    if (!response.ok) {
      throw new Error("Geocoding failed")
    }

    const data = await response.json()

    if (data.length === 0) {
      return null
    }

    const result = data[0]
    return {
      lat: Number.parseFloat(result.lat),
      lng: Number.parseFloat(result.lon),
      city: result.display_name.split(",")[0],
      address: result.display_name,
    }
  } catch (error) {
    console.error("[v0] Geocoding error:", error)
    return null
  }
}

// Filter items by distance from a location
export function filterByDistance<T extends { coordinates?: { lat: number; lng: number } | null }>(
  items: T[],
  userLocation: LocationData,
  radiusMiles: number,
): Array<T & { distance: number }> {
  return items
    .filter((item) => item.coordinates && item.coordinates.lat && item.coordinates.lng) // Skip items without valid coordinates
    .map((item) => ({
      ...item,
      distance: calculateDistance(userLocation.lat, userLocation.lng, item.coordinates!.lat, item.coordinates!.lng),
    }))
    .filter((item) => item.distance <= radiusMiles)
    .sort((a, b) => a.distance - b.distance)
}

// Save location preferences to localStorage
export function saveLocationPreferences(preferences: LocationPreferences): void {
  try {
    localStorage.setItem("locationPreferences", JSON.stringify(preferences))
    console.log("[v0] Saved location preferences", preferences)
  } catch (error) {
    console.error("[v0] Failed to save location preferences", error)
  }
}

// Load location preferences from localStorage
export function loadLocationPreferences(): LocationPreferences | null {
  try {
    const saved = localStorage.getItem("locationPreferences")
    if (!saved) return null

    const preferences = JSON.parse(saved)
    console.log("[v0] Loaded location preferences", preferences)
    return preferences
  } catch (error) {
    console.error("[v0] Failed to load location preferences", error)
    return null
  }
}

// Default radius options in miles
export const RADIUS_OPTIONS = [
  { value: 5, label: "5 miles" },
  { value: 10, label: "10 miles" },
  { value: 25, label: "25 miles" },
  { value: 50, label: "50 miles" },
  { value: 100, label: "100 miles" },
]
