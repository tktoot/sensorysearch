// Noise Level Options
export const NOISE_LEVELS = [
  { value: "quiet", label: "Quiet" },
  { value: "moderate", label: "Moderate" },
  { value: "loud_at_times", label: "Loud at times" },
] as const

export type NoiseLevel = (typeof NOISE_LEVELS)[number]["value"]

// Lighting Level Options
export const LIGHTING_LEVELS = [
  { value: "dim_soft", label: "Dim / soft" },
  { value: "moderate", label: "Moderate" },
  { value: "bright", label: "Bright" },
] as const

export type LightingLevel = (typeof LIGHTING_LEVELS)[number]["value"]

// Crowd Level Options
export const CROWD_LEVELS = [
  { value: "low", label: "Low" },
  { value: "moderate", label: "Moderate" },
  { value: "busy", label: "Busy" },
] as const

export type CrowdLevel = (typeof CROWD_LEVELS)[number]["value"]

// Density / Space to Move Options
export const DENSITY_LEVELS = [
  { value: "spacious", label: "Spacious" },
  { value: "moderate", label: "Moderate" },
  { value: "tight_crowded", label: "Tight / crowded" },
] as const

export type DensityLevel = (typeof DENSITY_LEVELS)[number]["value"]

// Accessibility Fields (Checkboxes)
export const ACCESSIBILITY_FIELDS = [
  { id: "wheelchair_accessible", label: "Wheelchair accessible" },
  { id: "accessible_parking", label: "Accessible parking available" },
  { id: "accessible_restroom", label: "Accessible restroom available" },
] as const

// Sensory Supports (Checkboxes)
export const SENSORY_SUPPORTS = [
  { id: "quiet_space_available", label: "Quiet space available" },
  { id: "sensory_friendly_hours", label: "Sensory-friendly hours available" },
  { id: "headphones_allowed", label: "Headphones allowed / encouraged" },
  { id: "staff_trained", label: "Staff trained in sensory awareness (optional)" },
] as const

// Park-Specific Fields
export const PARK_FENCING_OPTIONS = [
  { value: "fully_fenced", label: "Fully fenced in" },
  { value: "partially_fenced", label: "Partially fenced" },
  { value: "not_fenced", label: "Not fenced" },
] as const

export const PARK_PET_POLICIES = [
  { id: "pets_allowed", label: "Pets allowed" },
  { id: "dogs_on_leash", label: "Dogs allowed on leash" },
  { id: "no_pets", label: "No pets allowed" },
] as const

export const PARK_AMENITIES = [
  { id: "shaded_areas", label: "Shaded areas available" },
  { id: "benches_seating", label: "Benches or seating available" },
  { id: "soft_ground", label: "Soft ground surface (rubber mulch, turf, etc.)" },
] as const

// Event-Specific Fields
export const EVENT_ENVIRONMENT = [
  { id: "amplified_sound", label: "Amplified sound used" },
  { id: "flashing_lights", label: "Flashing or strobe lights used" },
  { id: "indoor_event", label: "Indoor event" },
  { id: "outdoor_event", label: "Outdoor event" },
] as const

export const EVENT_CROWD_SIZE = [
  { value: "small", label: "Small (under 50)" },
  { value: "medium", label: "Medium (50–200)" },
  { value: "large", label: "Large (200+)" },
] as const

// Worship-Specific Fields
export const WORSHIP_FEATURES = [
  { id: "sensory_friendly_service", label: "Sensory-friendly service available" },
  { id: "quiet_cry_room", label: "Quiet room or cry room available" },
  { id: "flexible_seating", label: "Flexible seating available" },
  { id: "sensory_kits", label: "Headphones or sensory kits available" },
] as const

// Helper text
export const SENSORY_HELPER_TEXT = "These details help families know what to expect. Answer as best you can."
