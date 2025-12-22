export interface SensoryAttributes {
  noiseLevel: "quiet" | "moderate" | "loud"
  lighting: "dim" | "natural" | "bright"
  crowdDensity: "low" | "medium" | "high"
  hasQuietSpace: boolean
  wheelchairAccessible: boolean
  sensoryFriendlyHours: boolean
}

export interface Venue {
  id: string
  name: string
  category: string
  description: string
  address: string
  city: string
  coordinates: { lat: number; lng: number }
  sensoryAttributes: SensoryAttributes
  rating: number
  reviewCount: number
  imageUrl: string
  tags: string[]
  listingType: "business" | "community"
  contactEmail?: string
  contactWebsite?: string
  status?: "pending" | "approved" | "rejected"
  submittedAt?: string
  approvedAt?: string
  submittedBy?: string
}

export interface Event {
  id: string
  name: string
  venueId: string
  venueName: string
  date: string
  time: string
  description: string
  sensoryAttributes: SensoryAttributes
  capacity: number
  registered: number
  crowdLevel?: "small" | "normal" | "large" | null
  imageUrl: string
  tags: string[]
  ageRange: {
    min: number
    max: number
  }
  hash_signature?: string
  businessEmail?: string
  isFreeTrialEvent?: boolean
  coordinates?: { lat: number; lng: number }
  category?: string
  status?: "pending" | "approved" | "rejected"
  submittedAt?: string
  approvedAt?: string
  submittedBy?: string
  listingType?: "paid" | "free"
}

export const mockVenues: Venue[] = []
export const mockEvents: Event[] = []
export const mockSubmissions: Venue[] = []

export function getAgeRangeFromPreference(
  preference: "toddlers" | "children" | "teens" | "adults" | null,
): { min: number; max: number } | null {
  switch (preference) {
    case "toddlers":
      return { min: 0, max: 5 }
    case "children":
      return { min: 6, max: 12 }
    case "teens":
      return { min: 13, max: 17 }
    case "adults":
      return { min: 18, max: 99 }
    default:
      return null
  }
}

export function filterEventsByAge(
  events: Event[],
  agePreference: "toddlers" | "children" | "teens" | "adults" | null,
): Event[] {
  if (!agePreference) return events

  const userAgeRange = getAgeRangeFromPreference(agePreference)
  if (!userAgeRange) return events

  return events.filter((event) => {
    // Check if there's any overlap between user age range and event age range
    return userAgeRange.min <= event.ageRange.max && userAgeRange.max >= event.ageRange.min
  })
}

export function filterActiveEvents(events: Event[]): Event[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Start of today

  return events.filter((event) => {
    const eventDate = new Date(event.date)
    eventDate.setHours(0, 0, 0, 0)
    return eventDate >= today
  })
}

export function filterPastEvents(events: Event[]): Event[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Start of today

  return events.filter((event) => {
    const eventDate = new Date(event.date)
    eventDate.setHours(0, 0, 0, 0)
    return eventDate < today
  })
}

export function duplicateEvent(event: Event, newDate: string, newTime: string): Event {
  return {
    ...event,
    id: `${event.id}-duplicate-${Date.now()}`,
    date: newDate,
    time: newTime,
    registered: 0, // Reset registration count
  }
}

export function computeEventHashSignature(venueName: string, startTime: string, title: string): string {
  const normalizedTitle = title.toLowerCase().trim().replace(/\s+/g, " ")
  const normalizedVenue = venueName.toLowerCase().trim()
  const signature = `${normalizedVenue}|${startTime}|${normalizedTitle}`
  // Simple hash function (in production, use a proper hash like SHA-256)
  let hash = 0
  for (let i = 0; i < signature.length; i++) {
    const char = signature.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

export function isEligibleForFreeTrial(profile: {
  phone_verified_at?: string | null
  free_trial_used?: boolean
  billing_payment_method_id?: string | null
  email_domain?: string
  is_domain_whitelisted?: boolean
}): boolean {
  const hasPhoneVerified = !!profile.phone_verified_at
  const hasNotUsedTrial = !profile.free_trial_used
  const hasPaymentMethod = !!profile.billing_payment_method_id || !!profile.is_domain_whitelisted

  return hasPhoneVerified && hasNotUsedTrial && hasPaymentMethod
}

export function checkRateLimit(profile: {
  submission_count_last_hour?: number
  last_submission_time?: string
}): { allowed: boolean; message?: string } {
  const now = new Date()
  const lastSubmission = profile.last_submission_time ? new Date(profile.last_submission_time) : null
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000)

  if (lastSubmission && lastSubmission > hourAgo) {
    const count = profile.submission_count_last_hour || 0
    if (count >= 3) {
      return {
        allowed: false,
        message: "You've reached the maximum of 3 submissions per hour. Please try again later.",
      }
    }
  }

  return { allowed: true }
}

export const WHITELISTED_DOMAINS = ["ymca.org", "jcc.org", "library.org", "museum.org", "edu", "gov"]

export function isEmailDomainWhitelisted(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase()
  if (!domain) return false

  return WHITELISTED_DOMAINS.some((whitelisted) => domain === whitelisted || domain.endsWith(`.${whitelisted}`))
}
