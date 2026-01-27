/**
 * Normalizes sensory features from form data to database format.
 * 
 * Database expects: text[] (array of strings)
 * Forms send: nested objects with multiple properties
 * 
 * This helper converts various input shapes into the string array format
 * required by Supabase's ARRAY column type.
 */

interface SensoryInput {
  sensory?: {
    noiseLevel?: string
    lightingLevel?: string
    crowdLevel?: string
    densityLevel?: string
  }
  accessibility?: {
    wheelchairAccessible?: boolean
    accessibleParking?: boolean
    accessibleRestroom?: boolean
  }
  sensorySupports?: {
    quietSpaceAvailable?: boolean
    sensoryFriendlyHours?: boolean
    headphonesAllowed?: boolean
    staffTrained?: boolean
  }
  eventEnvironment?: {
    amplifiedSound?: boolean
    flashingLights?: boolean
    indoorEvent?: boolean
    outdoorEvent?: boolean
    expectedCrowdSize?: string
  }
  parkFeatures?: {
    fencingType?: string
    petsAllowed?: boolean
    dogsOnLeash?: boolean
    noPets?: boolean
    shadedAreas?: boolean
    benchesSeating?: boolean
    softGround?: boolean
  }
  worshipFeatures?: {
    sensoryFriendlyService?: boolean
    quietCryRoom?: boolean
    flexibleSeating?: boolean
    sensoryKits?: boolean
  }
}

export function normalizeSensoryFeatures(input: SensoryInput | string[] | string | undefined): string[] {
  // Handle null/undefined
  if (!input) {
    return []
  }

  // Already an array - validate and return
  if (Array.isArray(input)) {
    return input.filter((item) => typeof item === "string" && item.trim().length > 0)
  }

  // String - split by comma and trim
  if (typeof input === "string") {
    return input
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
  }

  // Object - convert to feature array
  const features: string[] = []

  // Sensory levels
  if (input.sensory) {
    if (input.sensory.noiseLevel) {
      features.push(`Noise: ${input.sensory.noiseLevel}`)
    }
    if (input.sensory.lightingLevel) {
      features.push(`Lighting: ${input.sensory.lightingLevel}`)
    }
    if (input.sensory.crowdLevel) {
      features.push(`Crowd: ${input.sensory.crowdLevel}`)
    }
    if (input.sensory.densityLevel) {
      features.push(`Density: ${input.sensory.densityLevel}`)
    }
  }

  // Accessibility features
  if (input.accessibility) {
    if (input.accessibility.wheelchairAccessible) {
      features.push("Wheelchair Accessible")
    }
    if (input.accessibility.accessibleParking) {
      features.push("Accessible Parking")
    }
    if (input.accessibility.accessibleRestroom) {
      features.push("Accessible Restroom")
    }
  }

  // Sensory supports
  if (input.sensorySupports) {
    if (input.sensorySupports.quietSpaceAvailable) {
      features.push("Quiet Space Available")
    }
    if (input.sensorySupports.sensoryFriendlyHours) {
      features.push("Sensory-Friendly Hours")
    }
    if (input.sensorySupports.headphonesAllowed) {
      features.push("Headphones Allowed")
    }
    if (input.sensorySupports.staffTrained) {
      features.push("Staff Trained")
    }
  }

  // Event-specific
  if (input.eventEnvironment) {
    if (input.eventEnvironment.amplifiedSound) {
      features.push("Amplified Sound")
    }
    if (input.eventEnvironment.flashingLights) {
      features.push("Flashing Lights")
    }
    if (input.eventEnvironment.indoorEvent) {
      features.push("Indoor Event")
    }
    if (input.eventEnvironment.outdoorEvent) {
      features.push("Outdoor Event")
    }
    if (input.eventEnvironment.expectedCrowdSize) {
      features.push(`Expected Crowd: ${input.eventEnvironment.expectedCrowdSize}`)
    }
  }

  // Park-specific
  if (input.parkFeatures) {
    if (input.parkFeatures.fencingType) {
      features.push(`Fencing: ${input.parkFeatures.fencingType}`)
    }
    if (input.parkFeatures.petsAllowed) {
      features.push("Pets Allowed")
    }
    if (input.parkFeatures.dogsOnLeash) {
      features.push("Dogs on Leash")
    }
    if (input.parkFeatures.noPets) {
      features.push("No Pets")
    }
    if (input.parkFeatures.shadedAreas) {
      features.push("Shaded Areas")
    }
    if (input.parkFeatures.benchesSeating) {
      features.push("Benches/Seating")
    }
    if (input.parkFeatures.softGround) {
      features.push("Soft Ground")
    }
  }

  // Worship-specific
  if (input.worshipFeatures) {
    if (input.worshipFeatures.sensoryFriendlyService) {
      features.push("Sensory-Friendly Service")
    }
    if (input.worshipFeatures.quietCryRoom) {
      features.push("Quiet Cry Room")
    }
    if (input.worshipFeatures.flexibleSeating) {
      features.push("Flexible Seating")
    }
    if (input.worshipFeatures.sensoryKits) {
      features.push("Sensory Kits Available")
    }
  }

  // Development guard - log if normalization produces empty array from non-empty input
  if (process.env.NODE_ENV === "development" && features.length === 0 && Object.keys(input).length > 0) {
    console.warn("[v0] normalizeSensoryFeatures: Non-empty input produced empty features array", input)
  }

  return features
}
