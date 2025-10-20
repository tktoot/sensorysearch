import type { Venue, Event } from "./mock-data"
import { SEED_BETA_DATA } from "./config"

/**
 * Beta Seed Data for Philadelphia / 18076 Area
 * Only loads when SEED_BETA_DATA=true
 */

// Helper to generate future dates with time
function addDays(baseDate: Date, daysFromNow: number, hours: number, minutes: number): string {
  const date = new Date(baseDate)
  date.setDate(date.getDate() + daysFromNow)
  date.setHours(hours, minutes, 0, 0)
  return date.toISOString()
}

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

// Beta Community Venues (Parks & Playgrounds) near Philadelphia/18076
const betaCommunityVenues: Venue[] = [
  {
    id: "beta-venue-1",
    name: "Smith Memorial Playground & Playhouse",
    category: "Playground",
    description:
      "Large outdoor playground with quiet nooks and accessible paths. Historic playhouse with indoor activities. Features giant wooden slide, swings, and sensory-friendly play areas perfect for children of all abilities.",
    address: "3500 Reservoir Dr",
    city: "Philadelphia",
    coordinates: { lat: 39.9789, lng: -75.2009 },
    sensoryAttributes: {
      noiseLevel: "moderate",
      lighting: "natural",
      crowdDensity: "medium",
      hasQuietSpace: true,
      wheelchairAccessible: true,
      sensoryFriendlyHours: false,
    },
    rating: 4.8,
    reviewCount: 456,
    imageUrl: "/inclusive-playground.jpg",
    tags: ["Playground", "Historic", "Free", "Accessible", "Indoor/Outdoor"],
    listingType: "community",
    contactWebsite: "https://smithplayground.org",
    status: "approved",
    submittedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    submittedBy: "community@sensorysearch.com",
  },
  {
    id: "beta-venue-2",
    name: "Fischer's Park Inclusive Playground",
    category: "Playground",
    description:
      "Inclusive equipment, smooth paths, and nearby creek trail. Designed for children of all abilities with wheelchair-accessible play structures, sensory panels, and quiet zones.",
    address: "2225 Bustard Rd",
    city: "Harleysville",
    coordinates: { lat: 40.2756, lng: -75.3889 },
    sensoryAttributes: {
      noiseLevel: "quiet",
      lighting: "natural",
      crowdDensity: "low",
      hasQuietSpace: true,
      wheelchairAccessible: true,
      sensoryFriendlyHours: false,
    },
    rating: 4.9,
    reviewCount: 234,
    imageUrl: "/inclusive-playground.jpg",
    tags: ["Inclusive", "Playground", "Free", "Accessible", "Creek Trail"],
    listingType: "community",
    status: "approved",
    submittedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    submittedBy: "community@sensorysearch.com",
  },
  {
    id: "beta-venue-3",
    name: "Kids Castle at Central Park",
    category: "Playground",
    description:
      "Expansive playground with quiet areas on outer walking loops. Castle-themed play structure with multiple levels, slides, and climbing areas. Shaded picnic areas and accessible pathways.",
    address: "425 Wells Rd",
    city: "Doylestown",
    coordinates: { lat: 40.3106, lng: -75.1319 },
    sensoryAttributes: {
      noiseLevel: "moderate",
      lighting: "natural",
      crowdDensity: "medium",
      hasQuietSpace: true,
      wheelchairAccessible: true,
      sensoryFriendlyHours: false,
    },
    rating: 4.7,
    reviewCount: 389,
    imageUrl: "/inclusive-playground.jpg",
    tags: ["Playground", "Castle Theme", "Free", "Shaded Areas"],
    listingType: "community",
    status: "approved",
    submittedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    submittedBy: "community@sensorysearch.com",
  },
  {
    id: "beta-venue-4",
    name: "Green Lane Park — Walt Rd Playground",
    category: "Park",
    description:
      "Calm lakeside paths, shaded tables, and open fields. Large county park with nature trails, fishing areas, and peaceful spots perfect for families seeking quiet outdoor experiences.",
    address: "2144 Snyder Rd",
    city: "Green Lane",
    coordinates: { lat: 40.3356, lng: -75.4714 },
    sensoryAttributes: {
      noiseLevel: "quiet",
      lighting: "natural",
      crowdDensity: "low",
      hasQuietSpace: true,
      wheelchairAccessible: true,
      sensoryFriendlyHours: false,
    },
    rating: 4.8,
    reviewCount: 567,
    imageUrl: "/peaceful-botanical-garden.jpg",
    tags: ["Park", "Lake", "Nature", "Free", "Trails"],
    listingType: "community",
    contactEmail: "parks@montcopa.org",
    contactWebsite: "https://www.montcopa.org/1346/Green-Lane-Park",
    status: "approved",
    submittedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    submittedBy: "community@sensorysearch.com",
  },
  {
    id: "beta-venue-5",
    name: "Peace Valley Park",
    category: "Park",
    description:
      "Wide walking paths, bird blind, and quiet lakeside spots. Scenic park surrounding Lake Galena with paved trails, nature center, and peaceful picnic areas. Perfect for bird watching and calm outdoor activities.",
    address: "230 Creek Rd",
    city: "Doylestown",
    coordinates: { lat: 40.3456, lng: -75.1619 },
    sensoryAttributes: {
      noiseLevel: "quiet",
      lighting: "natural",
      crowdDensity: "low",
      hasQuietSpace: true,
      wheelchairAccessible: true,
      sensoryFriendlyHours: false,
    },
    rating: 4.9,
    reviewCount: 678,
    imageUrl: "/sensory-garden.jpg",
    tags: ["Park", "Lake", "Nature Center", "Bird Watching", "Free"],
    listingType: "community",
    contactEmail: "parks@buckscounty.org",
    contactWebsite: "https://www.buckscounty.org/government/ParksandRec/Parks/PeaceValley",
    status: "approved",
    submittedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    submittedBy: "community@sensorysearch.com",
  },
  {
    id: "beta-venue-6",
    name: "Lukens Park (Candy Cane Park)",
    category: "Playground",
    description:
      "Fenced area with inclusive play structures and picnic space. Popular neighborhood park with accessible equipment, swings, and shaded seating areas. Safe enclosed environment for children.",
    address: "540 Dresher Rd",
    city: "Horsham",
    coordinates: { lat: 40.1856, lng: -75.1319 },
    sensoryAttributes: {
      noiseLevel: "moderate",
      lighting: "natural",
      crowdDensity: "medium",
      hasQuietSpace: true,
      wheelchairAccessible: true,
      sensoryFriendlyHours: false,
    },
    rating: 4.6,
    reviewCount: 298,
    imageUrl: "/inclusive-playground.jpg",
    tags: ["Playground", "Fenced", "Inclusive", "Free", "Shaded"],
    listingType: "community",
    status: "approved",
    submittedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    submittedBy: "community@sensorysearch.com",
  },
  {
    id: "beta-venue-7",
    name: "Mander Playground",
    category: "Playground",
    description:
      "Open fields nearby for low-stimulation breaks. Community playground with modern equipment and plenty of open space. Features accessible play structures and quiet zones away from main play areas.",
    address: "2140 N 33rd St",
    city: "Philadelphia",
    coordinates: { lat: 39.9956, lng: -75.1819 },
    sensoryAttributes: {
      noiseLevel: "moderate",
      lighting: "natural",
      crowdDensity: "medium",
      hasQuietSpace: true,
      wheelchairAccessible: true,
      sensoryFriendlyHours: false,
    },
    rating: 4.5,
    reviewCount: 167,
    imageUrl: "/inclusive-playground.jpg",
    tags: ["Playground", "Open Fields", "Free", "Accessible"],
    listingType: "community",
    status: "approved",
    submittedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    submittedBy: "community@sensorysearch.com",
  },
  {
    id: "beta-venue-8",
    name: "Norristown Farm Park — Main Playground",
    category: "Park",
    description:
      "Paved paths and quiet meadow sections. Large park with walking trails, sports fields, and peaceful natural areas. Features accessible pathways and plenty of space for families to spread out.",
    address: "2500 Upper Farm Rd",
    city: "Norristown",
    coordinates: { lat: 40.1456, lng: -75.3519 },
    sensoryAttributes: {
      noiseLevel: "quiet",
      lighting: "natural",
      crowdDensity: "low",
      hasQuietSpace: true,
      wheelchairAccessible: true,
      sensoryFriendlyHours: false,
    },
    rating: 4.7,
    reviewCount: 423,
    imageUrl: "/peaceful-botanical-garden.jpg",
    tags: ["Park", "Trails", "Meadows", "Free", "Accessible"],
    listingType: "community",
    status: "approved",
    submittedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    submittedBy: "community@sensorysearch.com",
  },
]

const betaEvents: Event[] = [
  {
    id: "beta-event-1",
    name: "Sensory-Friendly Story Time",
    venueId: "beta-venue-library",
    venueName: "Harleysville Library",
    date: addDays(startOfDay(new Date()), 7, 10, 0).split("T")[0],
    time: "10:00 AM - 11:00 AM",
    description:
      "Quiet space, visual schedule, flexible seating. Story time designed for children with sensory sensitivities. Dimmed lights, reduced noise, and sensory tools available.",
    sensoryAttributes: {
      noiseLevel: "quiet",
      lighting: "dim",
      crowdDensity: "low",
      hasQuietSpace: true,
      wheelchairAccessible: true,
      sensoryFriendlyHours: true,
    },
    capacity: 20,
    registered: 12,
    imageUrl: "/quiet-library-reading-room.jpg",
    tags: ["sensory-friendly", "story-time", "children", "library"],
    ageRange: { min: 2, max: 8 },
    coordinates: { lat: 40.2756, lng: -75.3889 },
    category: "Library",
    listingType: "event",
    price: "Free",
    status: "approved",
    submittedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    submittedBy: "library@sensorysearch.com",
  },
  {
    id: "beta-event-2",
    name: "Quiet Morning at the Museum",
    venueId: "beta-venue-museum",
    venueName: "Philadelphia Children's Museum",
    date: addDays(startOfDay(new Date()), 14, 9, 30).split("T")[0],
    time: "9:30 AM - 11:30 AM",
    description:
      "Reduced lighting and sound, limited capacity. Early morning access before general admission with sensory accommodations. Staff trained in sensory support.",
    sensoryAttributes: {
      noiseLevel: "quiet",
      lighting: "dim",
      crowdDensity: "low",
      hasQuietSpace: true,
      wheelchairAccessible: true,
      sensoryFriendlyHours: true,
    },
    capacity: 50,
    registered: 32,
    imageUrl: "/calm-art-gallery-interior.jpg",
    tags: ["sensory-friendly", "museum", "quiet-hours", "children"],
    ageRange: { min: 0, max: 12 },
    coordinates: { lat: 39.9789, lng: -75.2009 },
    category: "Museum",
    listingType: "event",
    price: "$15",
    status: "approved",
    submittedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    submittedBy: "museum@sensorysearch.com",
  },
  {
    id: "beta-event-3",
    name: "Inclusive Play Gym Hour",
    venueId: "beta-venue-gym",
    venueName: "Lansdale Community Center",
    date: addDays(startOfDay(new Date()), 21, 16, 0).split("T")[0],
    time: "4:00 PM - 5:30 PM",
    description:
      "Small group, sensory tools provided. Structured play time with adaptive equipment and sensory-friendly activities. Trained staff to support all abilities.",
    sensoryAttributes: {
      noiseLevel: "moderate",
      lighting: "natural",
      crowdDensity: "low",
      hasQuietSpace: true,
      wheelchairAccessible: true,
      sensoryFriendlyHours: true,
    },
    capacity: 15,
    registered: 9,
    imageUrl: "/cozy-book-club-meeting.jpg",
    tags: ["sensory-friendly", "play", "inclusive", "children"],
    ageRange: { min: 3, max: 10 },
    coordinates: { lat: 40.2417, lng: -75.2838 },
    category: "Recreation",
    listingType: "event",
    price: "$10",
    status: "approved",
    submittedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    submittedBy: "gym@sensorysearch.com",
  },
  {
    id: "beta-event-4",
    name: "Sensory Cinema Matinee",
    venueId: "beta-venue-cinema",
    venueName: "Bensalem Movie Theater",
    date: addDays(startOfDay(new Date()), 28, 11, 0).split("T")[0],
    time: "11:00 AM - 12:45 PM",
    description:
      "Lights up, sound down; movement welcome. Family-friendly movie screening with sensory accommodations. No previews, reduced volume, and freedom to move around.",
    sensoryAttributes: {
      noiseLevel: "moderate",
      lighting: "dim",
      crowdDensity: "low",
      hasQuietSpace: false,
      wheelchairAccessible: true,
      sensoryFriendlyHours: true,
    },
    capacity: 100,
    registered: 67,
    imageUrl: "/cozy-quiet-cafe-interior.jpg",
    tags: ["sensory-friendly", "movie", "family", "cinema"],
    ageRange: { min: 0, max: 99 },
    coordinates: { lat: 40.1089, lng: -74.9519 },
    category: "Movie",
    listingType: "event",
    price: "$8",
    status: "approved",
    submittedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    submittedBy: "cinema@sensorysearch.com",
  },
  {
    id: "beta-event-5",
    name: "Calm Crafts Workshop",
    venueId: "beta-venue-arts",
    venueName: "Doylestown Arts Center",
    date: addDays(startOfDay(new Date()), 35, 13, 0).split("T")[0],
    time: "1:00 PM - 2:30 PM",
    description:
      "Hands-on art with visual instructions. Structured craft session with step-by-step visual guides and sensory-friendly materials. Small group setting with flexible participation.",
    sensoryAttributes: {
      noiseLevel: "quiet",
      lighting: "natural",
      crowdDensity: "low",
      hasQuietSpace: true,
      wheelchairAccessible: true,
      sensoryFriendlyHours: true,
    },
    capacity: 12,
    registered: 8,
    imageUrl: "/art-gallery-private-tour.jpg",
    tags: ["sensory-friendly", "crafts", "art", "children"],
    ageRange: { min: 5, max: 12 },
    coordinates: { lat: 40.3106, lng: -75.1319 },
    category: "Art",
    listingType: "event",
    price: "$12",
    status: "approved",
    submittedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    submittedBy: "arts@sensorysearch.com",
  },
  {
    id: "beta-event-6",
    name: "Sensory Swim Hour",
    venueId: "beta-venue-pool",
    venueName: "Quakertown Community Pool",
    date: addDays(startOfDay(new Date()), 42, 15, 0).split("T")[0],
    time: "3:00 PM - 4:00 PM",
    description:
      "Warm pool, quiet deck, limited entries. Dedicated swim time with reduced capacity and sensory accommodations. Lifeguards trained in sensory support.",
    sensoryAttributes: {
      noiseLevel: "quiet",
      lighting: "natural",
      crowdDensity: "low",
      hasQuietSpace: true,
      wheelchairAccessible: true,
      sensoryFriendlyHours: true,
    },
    capacity: 25,
    registered: 18,
    imageUrl: "/peaceful-beach-trail.jpg",
    tags: ["sensory-friendly", "swimming", "pool", "children"],
    ageRange: { min: 0, max: 99 },
    coordinates: { lat: 40.4417, lng: -75.3419 },
    category: "Recreation",
    listingType: "event",
    price: "$5",
    status: "approved",
    submittedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    submittedBy: "pool@sensorysearch.com",
  },
  // Events near 18076 (within 15-20 miles)
  {
    id: "beta-event-18076-1",
    name: "Sensory-Friendly Story Time at Bethlehem Library",
    venueId: "beta-venue-bethlehem-library",
    venueName: "Bethlehem Public Library",
    date: addDays(startOfDay(new Date()), 5, 10, 30).split("T")[0],
    time: "10:30 AM - 11:30 AM",
    description:
      "Quiet story time with dimmed lights, visual schedules, and flexible seating. Perfect for children with sensory sensitivities. Fidget tools and noise-canceling headphones available.",
    sensoryAttributes: {
      noiseLevel: "quiet",
      lighting: "dim",
      crowdDensity: "low",
      hasQuietSpace: true,
      wheelchairAccessible: true,
      sensoryFriendlyHours: true,
    },
    capacity: 15,
    registered: 8,
    imageUrl: "/quiet-library-reading-room.jpg",
    tags: ["sensory-friendly", "story-time", "children", "library", "free"],
    ageRange: { min: 2, max: 8 },
    coordinates: { lat: 40.6259, lng: -75.3705 },
    category: "Library",
    listingType: "event",
    price: "Free",
    status: "approved",
    submittedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    submittedBy: "library@sensorysearch.com",
  },
  {
    id: "beta-event-18076-2",
    name: "Calm Morning at DaVinci Science Center",
    venueId: "beta-venue-davinci",
    venueName: "DaVinci Science Center",
    date: addDays(startOfDay(new Date()), 9, 9, 0).split("T")[0],
    time: "9:00 AM - 10:30 AM",
    description:
      "Early access before general admission with reduced lighting and sound. Interactive exhibits at your own pace. Staff trained in sensory support available throughout.",
    sensoryAttributes: {
      noiseLevel: "quiet",
      lighting: "dim",
      crowdDensity: "low",
      hasQuietSpace: true,
      wheelchairAccessible: true,
      sensoryFriendlyHours: true,
    },
    capacity: 40,
    registered: 28,
    imageUrl: "/calm-art-gallery-interior.jpg",
    tags: ["sensory-friendly", "science", "museum", "children", "educational"],
    ageRange: { min: 3, max: 12 },
    coordinates: { lat: 40.6095, lng: -75.4714 },
    category: "Museum",
    listingType: "event",
    price: "$12",
    status: "approved",
    submittedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    submittedBy: "davinci@sensorysearch.com",
  },
  {
    id: "beta-event-18076-3",
    name: "Sensory Swim at Quakertown Pool",
    venueId: "beta-venue-quakertown-pool",
    venueName: "Quakertown Community Pool",
    date: addDays(startOfDay(new Date()), 12, 15, 0).split("T")[0],
    time: "3:00 PM - 4:00 PM",
    description:
      "Dedicated swim time with reduced capacity and quiet environment. Warm water, gentle music, and lifeguards trained in sensory support. Flotation devices and sensory toys available.",
    sensoryAttributes: {
      noiseLevel: "quiet",
      lighting: "natural",
      crowdDensity: "low",
      hasQuietSpace: true,
      wheelchairAccessible: true,
      sensoryFriendlyHours: true,
    },
    capacity: 20,
    registered: 14,
    imageUrl: "/peaceful-beach-trail.jpg",
    tags: ["sensory-friendly", "swimming", "pool", "children", "recreation"],
    ageRange: { min: 0, max: 99 },
    coordinates: { lat: 40.4417, lng: -75.3419 },
    category: "Recreation",
    listingType: "event",
    price: "$5",
    status: "approved",
    submittedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    submittedBy: "pool@sensorysearch.com",
  },
  {
    id: "beta-event-18076-4",
    name: "Quiet Art Workshop at Allentown Art Museum",
    venueId: "beta-venue-allentown-art",
    venueName: "Allentown Art Museum",
    date: addDays(startOfDay(new Date()), 16, 13, 30).split("T")[0],
    time: "1:30 PM - 3:00 PM",
    description:
      "Hands-on art activities with visual instructions and sensory-friendly materials. Small group setting with flexible participation. Create your own masterpiece in a calm environment.",
    sensoryAttributes: {
      noiseLevel: "quiet",
      lighting: "natural",
      crowdDensity: "low",
      hasQuietSpace: true,
      wheelchairAccessible: true,
      sensoryFriendlyHours: true,
    },
    capacity: 12,
    registered: 7,
    imageUrl: "/art-gallery-private-tour.jpg",
    tags: ["sensory-friendly", "art", "crafts", "children", "creative"],
    ageRange: { min: 5, max: 12 },
    coordinates: { lat: 40.6023, lng: -75.4714 },
    category: "Art",
    listingType: "event",
    price: "$10",
    status: "approved",
    submittedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    submittedBy: "art@sensorysearch.com",
  },
  {
    id: "beta-event-18076-5",
    name: "Sensory Cinema at Frank Theatres",
    venueId: "beta-venue-frank-theatres",
    venueName: "Frank Theatres Quakertown",
    date: addDays(startOfDay(new Date()), 19, 11, 0).split("T")[0],
    time: "11:00 AM - 12:45 PM",
    description:
      "Family-friendly movie with lights up, sound down, and movement welcome. No previews, reduced volume, and freedom to move around. Sensory bags available at the door.",
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
    imageUrl: "/cozy-quiet-cafe-interior.jpg",
    tags: ["sensory-friendly", "movie", "cinema", "family", "entertainment"],
    ageRange: { min: 0, max: 99 },
    coordinates: { lat: 40.4389, lng: -75.3419 },
    category: "Movie",
    listingType: "event",
    price: "$8",
    status: "approved",
    submittedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    submittedBy: "cinema@sensorysearch.com",
  },
  {
    id: "beta-event-18076-6",
    name: "Inclusive Play Session at Perkiomen Valley YMCA",
    venueId: "beta-venue-pv-ymca",
    venueName: "Perkiomen Valley YMCA",
    date: addDays(startOfDay(new Date()), 23, 16, 0).split("T")[0],
    time: "4:00 PM - 5:30 PM",
    description:
      "Structured play time with adaptive equipment and sensory-friendly activities. Small group setting with trained staff to support all abilities. Includes gym time and quiet room access.",
    sensoryAttributes: {
      noiseLevel: "moderate",
      lighting: "natural",
      crowdDensity: "low",
      hasQuietSpace: true,
      wheelchairAccessible: true,
      sensoryFriendlyHours: true,
    },
    capacity: 15,
    registered: 10,
    imageUrl: "/cozy-book-club-meeting.jpg",
    tags: ["sensory-friendly", "play", "inclusive", "children", "ymca"],
    ageRange: { min: 3, max: 10 },
    coordinates: { lat: 40.3156, lng: -75.4519 },
    category: "Recreation",
    listingType: "event",
    price: "$8",
    status: "approved",
    submittedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    submittedBy: "ymca@sensorysearch.com",
  },
  {
    id: "beta-event-18076-7",
    name: "Nature Walk at Green Lane Park",
    venueId: "beta-venue-4",
    venueName: "Green Lane Park",
    date: addDays(startOfDay(new Date()), 26, 10, 0).split("T")[0],
    time: "10:00 AM - 11:30 AM",
    description:
      "Guided nature walk on accessible trails with sensory-friendly pace. Learn about local wildlife and plants. Quiet observation time and rest stops included. Binoculars and field guides provided.",
    sensoryAttributes: {
      noiseLevel: "quiet",
      lighting: "natural",
      crowdDensity: "low",
      hasQuietSpace: true,
      wheelchairAccessible: true,
      sensoryFriendlyHours: true,
    },
    capacity: 20,
    registered: 13,
    imageUrl: "/peaceful-botanical-garden.jpg",
    tags: ["sensory-friendly", "nature", "outdoor", "educational", "free"],
    ageRange: { min: 5, max: 99 },
    coordinates: { lat: 40.3356, lng: -75.4714 },
    category: "Outdoor",
    listingType: "event",
    price: "Free",
    status: "approved",
    submittedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    submittedBy: "parks@sensorysearch.com",
  },
  {
    id: "beta-event-18076-8",
    name: "Calm Crafts at Perkasie Library",
    venueId: "beta-venue-perkasie-library",
    venueName: "Perkasie Branch Library",
    date: addDays(startOfDay(new Date()), 30, 14, 0).split("T")[0],
    time: "2:00 PM - 3:30 PM",
    description:
      "Hands-on craft session with step-by-step visual guides. Sensory-friendly materials and flexible participation. Create seasonal decorations in a calm, supportive environment.",
    sensoryAttributes: {
      noiseLevel: "quiet",
      lighting: "natural",
      crowdDensity: "low",
      hasQuietSpace: true,
      wheelchairAccessible: true,
      sensoryFriendlyHours: true,
    },
    capacity: 12,
    registered: 6,
    imageUrl: "/art-gallery-private-tour.jpg",
    tags: ["sensory-friendly", "crafts", "library", "children", "free"],
    ageRange: { min: 4, max: 10 },
    coordinates: { lat: 40.3717, lng: -75.2919 },
    category: "Library",
    listingType: "event",
    price: "Free",
    status: "approved",
    submittedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    submittedBy: "library@sensorysearch.com",
  },
]

/**
 * Seed beta data into localStorage
 * Only runs when SEED_BETA_DATA=true
 */
export function seedBetaData(): void {
  if (!SEED_BETA_DATA) {
    console.log("[v0] SEED_SKIPPED - SEED_BETA_DATA is false")
    return
  }

  if (typeof window === "undefined") {
    console.log("[v0] SEED_SKIPPED - Not in browser environment")
    return
  }

  try {
    // Check if already seeded
    const seeded = localStorage.getItem("beta_data_seeded")
    if (seeded === "true") {
      console.log("[v0] SEED_SKIPPED - Beta data already seeded")
      return
    }

    console.log("[v0] SEED_START - Loading beta venues and events")

    // Get existing data
    const existingVenues = JSON.parse(localStorage.getItem("venues") || "[]")
    const existingEvents = JSON.parse(localStorage.getItem("events") || "[]")

    // Merge with beta data (avoid duplicates by ID)
    const existingVenueIds = new Set(existingVenues.map((v: Venue) => v.id))
    const existingEventIds = new Set(existingEvents.map((e: Event) => e.id))

    const newVenues = betaCommunityVenues.filter((v) => !existingVenueIds.has(v.id))
    const newEvents = betaEvents.filter((e) => !existingEventIds.has(e.id))

    // Save merged data
    const allVenues = [...existingVenues, ...newVenues]
    const allEvents = [...existingEvents, ...newEvents]

    localStorage.setItem("venues", JSON.stringify(allVenues))
    localStorage.setItem("events", JSON.stringify(allEvents))
    localStorage.setItem("beta_data_seeded", "true")

    console.log(`[v0] SEED_COMPLETE - Added ${newVenues.length} venues and ${newEvents.length} events`)
    console.log(`[v0] SEED_TOTAL - ${allVenues.length} total venues, ${allEvents.length} total events`)
  } catch (error) {
    console.error("[v0] SEED_ERROR - Failed to seed beta data:", error)
  }
}

/**
 * Clear beta seed data (for testing)
 */
export function clearBetaData(): void {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem("beta_data_seeded")
    console.log("[v0] SEED_CLEARED - Beta data flag cleared")
  } catch (error) {
    console.error("[v0] SEED_CLEAR_ERROR:", error)
  }
}
