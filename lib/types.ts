// Central type definitions for the application

export type UserRole = "user" | "organizer" | "business" | "admin"

export interface User {
  id: string
  email: string
  role: UserRole
}

export interface ServerAuthUser {
  id: string
  email: string
  role: UserRole
}

export interface SubmissionNotificationData {
  title: string
  type: string
  submitterEmail: string
  submissionId: string
  images?: string[]
  address?: string
  date?: string
}

export interface SensoryAttributes {
  noiseLevel: string
  lighting: string
  crowdDensity: string
  hasQuietSpace: boolean
  wheelchairAccessible: boolean
  sensoryFriendlyHours: boolean
}

export interface UserProfile {
  id?: string
  email?: string
  home_zip?: string
  age_focus?: string
  agePreference?: "toddlers" | "children" | "teens" | "adults" | null
  favorites?: string[]
  has_seen_onboarding?: boolean
  radius_miles?: number
  created_at?: string
  updated_at?: string
}

export interface Venue {
  id: string
  name: string
  category: string
  description: string
  address: string
  city: string
  state?: string
  zip?: string
  coordinates?: { lat: number; lng: number } | null
  latitude?: number
  longitude?: number
  sensoryAttributes?: SensoryAttributes
  noise_level?: string
  lighting?: string
  crowd_level?: string
  sensory_features?: string[]
  accessibility_notes?: string
  rating?: number
  reviewCount?: number
  imageUrl?: string
  images?: string[]
  tags?: string[]
  listingType?: string
  hours?: string
  age_range?: string
  email?: string
  phone?: string
  website?: string
  social_link?: string
  organizer_id?: string
  submission_id?: string
  published_at?: string
  created_at?: string
  updated_at?: string
}

export interface Event {
  id: string
  name: string
  venueName?: string
  venueId?: string | null
  venue_name?: string
  date: string
  event_date?: string
  time?: string
  event_start_time?: string
  event_end_time?: string
  description: string
  sensoryAttributes?: SensoryAttributes
  noise_level?: string
  lighting?: string
  crowd_level?: string
  sensory_features?: string[]
  accessibility_notes?: string
  capacity?: number
  registered?: number
  imageUrl?: string
  images?: string[]
  tags?: string[]
  ageRange?: { min: number; max: number }
  age_range?: string
  coordinates?: { lat: number; lng: number } | null
  latitude?: number
  longitude?: number
  category?: string
  city?: string
  state?: string
  zip?: string
  address?: string
  email?: string
  phone?: string
  website?: string
  social_link?: string
  organizer_id?: string
  submission_id?: string
  published_at?: string
  created_at?: string
  updated_at?: string
}

export interface Park {
  id: string
  name: string
  description: string
  address: string
  city: string
  state?: string
  zip?: string
  coordinates?: { lat: number; lng: number } | null
  latitude?: number
  longitude?: number
  noise_level?: string
  crowd_level?: string
  sensory_features?: string[]
  accessibility_notes?: string
  images?: string[]
  hours?: string
  age_range?: string
  email?: string
  phone?: string
  website?: string
  organizer_id?: string
  submission_id?: string
  published_at?: string
  created_at?: string
  updated_at?: string
}

export interface Playground {
  id: string
  name: string
  description: string
  address: string
  city: string
  state?: string
  zip?: string
  coordinates?: { lat: number; lng: number } | null
  latitude?: number
  longitude?: number
  equipment_types?: string[]
  shade_available?: boolean
  age_range?: string
  noise_level?: string
  crowd_level?: string
  sensory_features?: string[]
  accessibility_notes?: string
  images?: string[]
  hours?: string
  email?: string
  phone?: string
  website?: string
  organizer_id?: string
  submission_id?: string
  published_at?: string
  created_at?: string
  updated_at?: string
}

export interface PlaceOfWorship {
  id: string
  name: string
  description: string
  denomination?: string
  address: string
  city: string
  state?: string
  zip?: string
  coordinates?: { lat: number; lng: number } | null
  latitude?: number
  longitude?: number
  noise_level?: string
  crowd_level?: string
  lighting?: string
  sensory_features?: string[]
  accessibility_notes?: string
  images?: string[]
  hours?: string
  service_times?: string
  email?: string
  phone?: string
  website?: string
  social_link?: string
  organizer_id?: string
  submission_id?: string
  published_at?: string
  created_at?: string
  updated_at?: string
}
