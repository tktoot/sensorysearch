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

export const mockVenues: Venue[] = [
  {
    id: "1",
    name: "Quiet Corner Cafe",
    category: "Cafe",
    description: "A peaceful cafe with soft lighting and comfortable seating. Perfect for a calm coffee break.",
    address: "123 Main St",
    city: "Bethlehem",
    coordinates: { lat: 40.6259, lng: -75.3705 },
    sensoryAttributes: {
      noiseLevel: "quiet",
      lighting: "dim",
      crowdDensity: "low",
      hasQuietSpace: true,
      wheelchairAccessible: true,
      sensoryFriendlyHours: true,
    },
    rating: 4.8,
    reviewCount: 124,
    imageUrl: "/cozy-quiet-cafe-interior.jpg",
    tags: ["Quiet", "Wheelchair Accessible", "Sensory-Friendly Hours"],
    listingType: "business",
    status: "approved",
    submittedAt: "2025-09-25T14:30:00Z",
    approvedAt: "2025-09-26T09:00:00Z",
    submittedBy: "user@example.com",
  },
  {
    id: "2",
    name: "Lehigh Valley Botanical Gardens",
    category: "Park",
    description: "Serene outdoor space with winding paths and beautiful plant collections.",
    address: "456 Garden Ave",
    city: "Allentown",
    coordinates: { lat: 40.6084, lng: -75.4902 },
    sensoryAttributes: {
      noiseLevel: "quiet",
      lighting: "natural",
      crowdDensity: "low",
      hasQuietSpace: true,
      wheelchairAccessible: true,
      sensoryFriendlyHours: false,
    },
    rating: 4.9,
    reviewCount: 287,
    imageUrl: "/peaceful-botanical-garden.jpg",
    tags: ["Outdoor", "Nature", "Quiet"],
    listingType: "community",
    contactEmail: "info@botanicalgardens.org",
    status: "pending",
    submittedAt: "2025-09-25T14:30:00Z",
    submittedBy: "user@example.com",
  },
  {
    id: "3",
    name: "Bethlehem Public Library - Reading Room",
    category: "Library",
    description: "Dedicated quiet reading space with natural light and comfortable chairs.",
    address: "789 Book Blvd",
    city: "Bethlehem",
    coordinates: { lat: 40.6178, lng: -75.3782 },
    sensoryAttributes: {
      noiseLevel: "quiet",
      lighting: "natural",
      crowdDensity: "low",
      hasQuietSpace: true,
      wheelchairAccessible: true,
      sensoryFriendlyHours: true,
    },
    rating: 4.7,
    reviewCount: 156,
    imageUrl: "/quiet-library-reading-room.jpg",
    tags: ["Quiet", "Indoor", "Free"],
    listingType: "business",
    status: "approved",
    submittedAt: "2025-09-25T14:30:00Z",
    approvedAt: "2025-09-26T09:00:00Z",
    submittedBy: "user@example.com",
  },
  {
    id: "4",
    name: "Allentown Art Museum",
    category: "Museum",
    description: "Small gallery with controlled lighting and spacious layout. Offers sensory-friendly viewing hours.",
    address: "321 Art Lane",
    city: "Allentown",
    coordinates: { lat: 40.6023, lng: -75.4714 },
    sensoryAttributes: {
      noiseLevel: "quiet",
      lighting: "dim",
      crowdDensity: "low",
      hasQuietSpace: true,
      wheelchairAccessible: true,
      sensoryFriendlyHours: true,
    },
    rating: 4.6,
    reviewCount: 89,
    imageUrl: "/calm-art-gallery-interior.jpg",
    tags: ["Art", "Sensory-Friendly Hours", "Quiet"],
    listingType: "business",
    status: "approved",
    submittedAt: "2025-09-25T14:30:00Z",
    approvedAt: "2025-09-26T09:00:00Z",
    submittedBy: "user@example.com",
  },
  {
    id: "5",
    name: "Saucon Rail Trail",
    category: "Park",
    description: "Peaceful walking trail with nature views and minimal crowds.",
    address: "555 Trail Rd",
    city: "Hellertown",
    coordinates: { lat: 40.5798, lng: -75.3401 },
    sensoryAttributes: {
      noiseLevel: "moderate",
      lighting: "natural",
      crowdDensity: "low",
      hasQuietSpace: true,
      wheelchairAccessible: false,
      sensoryFriendlyHours: false,
    },
    rating: 4.9,
    reviewCount: 342,
    imageUrl: "/peaceful-beach-trail.jpg",
    tags: ["Outdoor", "Nature", "Free"],
    listingType: "community",
    contactWebsite: "https://sauconrailtrail.org",
    status: "pending",
    submittedAt: "2025-09-25T14:30:00Z",
    submittedBy: "user@example.com",
  },
  {
    id: "6",
    name: "Cedar Creek Park Playground",
    category: "Playground",
    description:
      "Inclusive playground with sensory-friendly equipment, quiet zones, and accessible play structures. Features soft ground surfaces and shaded areas.",
    address: "890 Park Lane",
    city: "Allentown",
    coordinates: { lat: 40.5645, lng: -75.5234 },
    sensoryAttributes: {
      noiseLevel: "moderate",
      lighting: "natural",
      crowdDensity: "medium",
      hasQuietSpace: true,
      wheelchairAccessible: true,
      sensoryFriendlyHours: false,
    },
    rating: 4.7,
    reviewCount: 156,
    imageUrl: "/inclusive-playground.jpg",
    tags: ["Playground", "Inclusive", "Free", "Outdoor"],
    listingType: "community",
    contactEmail: "parks@allentownpa.gov",
    status: "approved",
    submittedAt: "2025-09-25T14:30:00Z",
    approvedAt: "2025-09-26T09:00:00Z",
    submittedBy: "user@example.com",
  },
  {
    id: "7",
    name: "Monocacy Creek Sensory Garden",
    category: "Park",
    description:
      "Community garden designed with sensory experiences in mind. Features fragrant plants, textured pathways, and quiet seating areas.",
    address: "234 Creek Road",
    city: "Bethlehem",
    coordinates: { lat: 40.6345, lng: -75.3612 },
    sensoryAttributes: {
      noiseLevel: "quiet",
      lighting: "natural",
      crowdDensity: "low",
      hasQuietSpace: true,
      wheelchairAccessible: true,
      sensoryFriendlyHours: false,
    },
    rating: 4.8,
    reviewCount: 98,
    imageUrl: "/sensory-garden.jpg",
    tags: ["Garden", "Sensory-Friendly", "Free", "Nature"],
    listingType: "community",
    contactEmail: "info@monocacygarden.org",
    contactWebsite: "https://monocacygarden.org",
    status: "approved",
    submittedAt: "2025-09-25T14:30:00Z",
    approvedAt: "2025-09-26T09:00:00Z",
    submittedBy: "user@example.com",
  },
]

export const mockEvents: Event[] = [
  {
    id: "1",
    name: "Sensory-Friendly Morning",
    venueId: "4",
    venueName: "DaVinci Science Center",
    date: "2025-10-12",
    time: "09:00 AM",
    description:
      "Interactive science museum offering sensory-friendly programs designed for children with sensory sensitivities. Features quiet spaces throughout the museum.",
    sensoryAttributes: {
      noiseLevel: "moderate",
      lighting: "natural",
      crowdDensity: "low",
      hasQuietSpace: true,
      wheelchairAccessible: true,
      sensoryFriendlyHours: true,
    },
    capacity: 50,
    registered: 32,
    crowdLevel: "small",
    imageUrl: "/outdoor-meditation-garden.jpg",
    tags: ["Children", "Interactive", "Quiet Spaces"],
    ageRange: { min: 0, max: 12 },
    businessEmail: "contact@davincisciencecenter.org",
    coordinates: { lat: 40.6089, lng: -75.4702 },
    category: "Museum",
    listingType: "free",
    status: "approved",
    submittedAt: "2025-09-25T14:30:00Z",
    approvedAt: "2025-09-26T09:00:00Z",
    submittedBy: "user@example.com",
  },
  {
    id: "2",
    name: "Sensory-Friendly Day",
    venueId: "4",
    venueName: "Crayola Experience",
    date: "2025-10-15",
    time: "10:00 AM",
    description:
      "Special sensory-friendly day at Crayola Experience in Easton with relaxed atmosphere, reduced noise, and accommodating staff.",
    sensoryAttributes: {
      noiseLevel: "moderate",
      lighting: "bright",
      crowdDensity: "low",
      hasQuietSpace: true,
      wheelchairAccessible: true,
      sensoryFriendlyHours: true,
    },
    capacity: 75,
    registered: 48,
    crowdLevel: "normal",
    imageUrl: "/cozy-book-club-meeting.jpg",
    tags: ["Children", "Creative", "Sensory-Friendly"],
    ageRange: { min: 3, max: 12 },
    businessEmail: "events@crayolaexperience.com",
    coordinates: { lat: 40.6884, lng: -75.2207 },
    category: "Museum",
    listingType: "paid",
    status: "pending",
    submittedAt: "2025-09-25T14:30:00Z",
    submittedBy: "user@example.com",
  },
  {
    id: "3",
    name: "Quiet Story Time",
    venueId: "3",
    venueName: "Bethlehem Public Library",
    date: "2025-10-18",
    time: "10:30 AM",
    description:
      "Gentle story time session with reduced capacity and sensory-friendly environment. Perfect for children who need a calmer setting.",
    sensoryAttributes: {
      noiseLevel: "quiet",
      lighting: "natural",
      crowdDensity: "low",
      hasQuietSpace: true,
      wheelchairAccessible: true,
      sensoryFriendlyHours: true,
    },
    capacity: 20,
    registered: 12,
    crowdLevel: "small",
    imageUrl: "/art-gallery-private-tour.jpg",
    tags: ["Children", "Reading", "Small Group"],
    ageRange: { min: 0, max: 8 },
    businessEmail: "info@bethlehempl.org",
    coordinates: { lat: 40.6178, lng: -75.3782 },
    category: "Library",
    listingType: "free",
    status: "approved",
    submittedAt: "2025-09-25T14:30:00Z",
    approvedAt: "2025-09-26T09:00:00Z",
    submittedBy: "user@example.com",
  },
  {
    id: "4",
    name: "Sensory-Friendly Evening",
    venueId: "4",
    venueName: "Dorney Park",
    date: "2025-10-22",
    time: "05:30 PM",
    description:
      "Special sensory-friendly evening with reduced crowds, dimmed lighting, and quieter environment for families with sensory needs.",
    sensoryAttributes: {
      noiseLevel: "moderate",
      lighting: "dim",
      crowdDensity: "low",
      hasQuietSpace: true,
      wheelchairAccessible: true,
      sensoryFriendlyHours: true,
    },
    capacity: 100,
    registered: 67,
    crowdLevel: "normal",
    imageUrl: "/outdoor-meditation-garden.jpg",
    tags: ["Children", "Amusement Park", "Evening Event"],
    ageRange: { min: 3, max: 99 },
    businessEmail: "info@dorneypark.com",
    coordinates: { lat: 40.5784, lng: -75.5401 },
    category: "Amusement Park",
    listingType: "paid",
    status: "approved",
    submittedAt: "2025-09-25T14:30:00Z",
    approvedAt: "2025-09-26T09:00:00Z",
    submittedBy: "user@example.com",
  },
  {
    id: "5",
    name: "Nature Walk for Families",
    venueId: "2",
    venueName: "Lehigh Parkway",
    date: "2025-10-26",
    time: "09:00 AM",
    description:
      "Guided nature walk with family resources, quiet zones, and accommodations for visitors with sensory sensitivities.",
    sensoryAttributes: {
      noiseLevel: "quiet",
      lighting: "natural",
      crowdDensity: "low",
      hasQuietSpace: true,
      wheelchairAccessible: true,
      sensoryFriendlyHours: true,
    },
    capacity: 30,
    registered: 18,
    crowdLevel: "small",
    imageUrl: "/peaceful-botanical-garden.jpg",
    tags: ["Outdoor", "Nature", "Family"],
    ageRange: { min: 0, max: 99 },
    businessEmail: "events@lehighparkway.org",
    coordinates: { lat: 40.5923, lng: -75.4856 },
    category: "Park",
    listingType: "free",
    status: "approved",
    submittedAt: "2025-09-25T14:30:00Z",
    approvedAt: "2025-09-26T09:00:00Z",
    submittedBy: "user@example.com",
  },
  {
    id: "6",
    name: "Sensory-Friendly Art Workshop",
    venueId: "4",
    venueName: "Allentown Art Museum",
    date: "2025-10-29",
    time: "02:00 PM",
    description:
      "Art workshop with quiet zones, reduced lighting, and a calm environment for visitors with sensory sensitivities.",
    sensoryAttributes: {
      noiseLevel: "quiet",
      lighting: "dim",
      crowdDensity: "low",
      hasQuietSpace: true,
      wheelchairAccessible: true,
      sensoryFriendlyHours: true,
    },
    capacity: 25,
    registered: 15,
    crowdLevel: "small",
    imageUrl: "/calm-art-gallery-interior.jpg",
    tags: ["Art", "Workshop", "Quiet Zones"],
    ageRange: { min: 8, max: 99 },
    businessEmail: "access@allentownartmuseum.org",
    coordinates: { lat: 40.6023, lng: -75.4714 },
    category: "Museum",
    listingType: "paid",
    status: "approved",
    submittedAt: "2025-09-25T14:30:00Z",
    approvedAt: "2025-09-26T09:00:00Z",
    submittedBy: "user@example.com",
  },
  {
    id: "7",
    name: "Sensory Friendly Cinema",
    venueId: "1",
    venueName: "Frank Banko Alehouse Cinemas",
    date: "2025-11-02",
    time: "10:00 AM",
    description:
      "Monthly sensory-friendly movie screening with reduced volume, dimmed lighting, and a welcoming environment for children with sensory needs.",
    sensoryAttributes: {
      noiseLevel: "moderate",
      lighting: "dim",
      crowdDensity: "low",
      hasQuietSpace: false,
      wheelchairAccessible: true,
      sensoryFriendlyHours: true,
    },
    capacity: 80,
    registered: 52,
    crowdLevel: "normal",
    imageUrl: "/cozy-quiet-cafe-interior.jpg",
    tags: ["Children", "Movies", "Monthly Event"],
    ageRange: { min: 0, max: 12 },
    businessEmail: "events@steelstacks.org",
    coordinates: { lat: 40.6156, lng: -75.3789 },
    category: "Cinema",
    listingType: "paid",
    status: "approved",
    submittedAt: "2025-09-25T14:30:00Z",
    approvedAt: "2025-09-26T09:00:00Z",
    submittedBy: "user@example.com",
  },
  {
    id: "8",
    name: "Halloween Sensory-Friendly Party",
    venueId: "1",
    venueName: "Lehigh Valley Autism Center",
    date: "2025-10-31",
    time: "04:00 PM",
    description:
      "Special Halloween-themed party designed for individuals with autism and their families. Features sensory-friendly music, lighting, and activities.",
    sensoryAttributes: {
      noiseLevel: "moderate",
      lighting: "dim",
      crowdDensity: "medium",
      hasQuietSpace: true,
      wheelchairAccessible: true,
      sensoryFriendlyHours: true,
    },
    capacity: 60,
    registered: 43,
    crowdLevel: "normal",
    imageUrl: "/cozy-book-club-meeting.jpg",
    tags: ["Social", "Holiday", "Party"],
    ageRange: { min: 0, max: 99 },
    businessEmail: "info@lehighvalleyautism.org",
    coordinates: { lat: 40.6234, lng: -75.3856 },
    category: "Community Center",
    listingType: "free",
    status: "approved",
    submittedAt: "2025-09-25T14:30:00Z",
    approvedAt: "2025-09-26T09:00:00Z",
    submittedBy: "user@example.com",
  },
]

export const mockSubmissions: Venue[] = [
  {
    id: "sub-1",
    name: "Tranquil Tea House",
    category: "Cafe",
    description: "A peaceful tea house with private booths and soft ambient music. Perfect for quiet conversations.",
    address: "789 Zen Street",
    city: "Bethlehem",
    coordinates: { lat: 40.6189, lng: -75.3694 },
    sensoryAttributes: {
      noiseLevel: "quiet",
      lighting: "dim",
      crowdDensity: "low",
      hasQuietSpace: true,
      wheelchairAccessible: true,
      sensoryFriendlyHours: true,
    },
    rating: 0,
    reviewCount: 0,
    imageUrl: "/tranquil-tea-house.jpg",
    tags: ["Quiet", "Tea", "Private Booths"],
    listingType: "business",
    status: "pending",
    submittedAt: "2025-09-28T14:30:00Z",
    submittedBy: "user@example.com",
  },
  {
    id: "sub-2",
    name: "Mindful Yoga Studio",
    category: "Wellness",
    description: "Small yoga studio with gentle classes and calming atmosphere. Maximum 8 people per class.",
    address: "456 Wellness Way",
    city: "Allentown",
    coordinates: { lat: 40.6012, lng: -75.4794 },
    sensoryAttributes: {
      noiseLevel: "quiet",
      lighting: "dim",
      crowdDensity: "low",
      hasQuietSpace: true,
      wheelchairAccessible: false,
      sensoryFriendlyHours: true,
    },
    rating: 0,
    reviewCount: 0,
    imageUrl: "/mindful-yoga-studio.jpg",
    tags: ["Yoga", "Wellness", "Small Groups"],
    listingType: "community",
    status: "approved",
    submittedAt: "2025-09-27T10:15:00Z",
    approvedAt: "2025-09-27T09:00:00Z",
    submittedBy: "wellness@example.com",
  },
]

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
