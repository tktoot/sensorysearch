"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Star, Volume2, Sun, Users, Calendar, Clock, Building2, Trees } from "lucide-react"
import { trackEventView } from "@/lib/analytics"
import Link from "next/link"
import { ProfileBanner } from "@/components/profile-banner"
import { LocationSelector } from "@/components/location-selector"
import { filterByDistance, type LocationPreferences } from "@/lib/location-utils"
import { FavoriteButton } from "@/components/favorite-button"
import { EmptyState } from "@/components/empty-state"
import { SkeletonCard } from "@/components/skeleton-card"
import { OpenInMapsButton } from "@/components/open-in-maps-button"
import { createBrowserClient } from "@/lib/supabase-browser-client"
import { EmailCaptureBanner } from "@/components/email-capture-banner"

// Local type definitions
type UserProfile = {
  agePreference: "toddlers" | "children" | "teens" | "adults" | null
}

type SensoryAttributes = {
  noiseLevel: string
  lighting: string
  crowdDensity: string
  hasQuietSpace: boolean
  wheelchairAccessible: boolean
  sensoryFriendlyHours: boolean
}

type Venue = {
  id: string
  name: string
  category: string
  description: string
  address: string
  city: string
  coordinates: { lat: number; lng: number } | null
  sensoryAttributes: SensoryAttributes
  rating: number
  imageUrl: string
  tags: string[]
  listingType: string
}

type Event = {
  id: string
  name: string
  venueName: string
  date: string
  time: string
  description: string
  sensoryAttributes: SensoryAttributes
  capacity: number
  registered: number
  imageUrl: string
  tags: string[]
  ageRange: { min: number; max: number }
  coordinates?: { lat: number; lng: number } | null
  category?: string
}

// Filter functions
function filterEventsByAge(events: Event[], agePreference: UserProfile["agePreference"]): Event[] {
  if (!agePreference) return events

  const ageRanges = {
    toddlers: { min: 0, max: 5 },
    children: { min: 6, max: 12 },
    teens: { min: 13, max: 17 },
    adults: { min: 18, max: 99 },
  }

  const userRange = ageRanges[agePreference]
  if (!userRange) return events

  return events.filter((event) => userRange.min <= event.ageRange.max && userRange.max >= event.ageRange.min)
}

function filterActiveEvents(events: Event[]): Event[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return events.filter((event) => {
    const eventDate = new Date(event.date)
    eventDate.setHours(0, 0, 0, 0)
    return eventDate >= today
  })
}

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [userProfile, setUserProfile] = useState<UserProfile>({ agePreference: null })
  const [locationPreferences, setLocationPreferences] = useState<LocationPreferences>({
    location: null,
    radius: 25,
    useCurrentLocation: false,
  })
  const [venues, setVenues] = useState<Venue[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [placesOfWorship, setPlacesOfWorship] = useState<Venue[]>([])
  const [parks, setParks] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSearchOverlay, setShowSearchOverlay] = useState(false)

  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile")
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile))
    }

    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        )

        const [venuesResult, eventsResult, worshipResult, parksResult, playgroundsResult] = await Promise.all([
          supabase.from("venues").select("*").order("created_at", { ascending: false }),
          supabase
            .from("events")
            .select("*")
            .gte("event_date", new Date().toISOString().split("T")[0])
            .order("event_date", { ascending: true }),
          supabase.from("places_of_worship").select("*").order("created_at", { ascending: false }),
          supabase.from("parks").select("*").order("created_at", { ascending: false }),
          supabase.from("playgrounds").select("*").order("created_at", { ascending: false }),
        ])

        if (venuesResult.data) {
          const mappedVenues = venuesResult.data.map((v: any) => ({
            id: v.id,
            name: v.name,
            description: v.description,
            category: v.category || "Other",
            city: v.city,
            address: v.address,
            rating: 4.5,
            imageUrl: v.images?.[0] || v.hero_image_url || "/elegant-wedding-venue.png",
            coordinates:
              v.latitude && v.longitude
                ? { lat: Number.parseFloat(v.latitude), lng: Number.parseFloat(v.longitude) }
                : null,
            sensoryAttributes: {
              noiseLevel: v.noise_level || "Moderate",
              lighting: v.lighting || "Natural",
              crowdDensity: v.crowd_level || "Moderate",
              hasQuietSpace: v.quiet_space_available || false,
              wheelchairAccessible: v.wheelchair_accessible || false,
              sensoryFriendlyHours: v.sensory_friendly_hours_available || false,
            },
            tags: v.sensory_features || [],
            listingType: "business",
          }))
          setVenues(mappedVenues)
          console.log("[v0] Loaded venues from database:", mappedVenues.length)
        }

        if (eventsResult.data) {
          const mappedEvents = eventsResult.data.map((e: any) => ({
            id: e.id,
            name: e.name,
            description: e.description,
            venueName: e.venue_name || e.address,
            venueId: e.venue_id || null,
            city: e.city,
            date: e.event_date,
            time: e.event_start_time || "TBD",
            imageUrl: e.images?.[0] || e.hero_image_url || "/community-event.png",
            capacity: e.capacity || 50,
            registered: 0,
            ageRange: { min: 0, max: 99 },
            coordinates:
              e.latitude && e.longitude
                ? { lat: Number.parseFloat(e.latitude), lng: Number.parseFloat(e.longitude) }
                : null,
            sensoryAttributes: {
              noiseLevel: e.noise_level || "Quiet",
              lighting: e.lighting || "Soft",
              crowdDensity: e.crowd_level || "Low",
              hasQuietSpace: e.quiet_space_available || false,
              wheelchairAccessible: e.wheelchair_accessible || false,
            },
            tags: e.sensory_features || [],
            businessEmail: e.email,
          }))
          setEvents(mappedEvents)
          console.log("[v0] Loaded events from database:", mappedEvents.length)
        }

        if (worshipResult.data) {
          const mappedWorship = worshipResult.data.map((w: any) => ({
            id: w.id,
            name: w.name,
            description: w.description,
            category: w.denomination || "Place of Worship",
            city: w.city,
            address: w.address,
            rating: 4.8,
            imageUrl: w.images?.[0] || "/act-of-worship.png",
            coordinates:
              w.latitude && w.longitude
                ? { lat: Number.parseFloat(w.latitude), lng: Number.parseFloat(w.longitude) }
                : null,
            sensoryAttributes: {
              noiseLevel: w.noise_level || "Quiet",
              lighting: w.lighting || "Soft",
              crowdDensity: w.crowd_level || "Moderate",
              hasQuietSpace: w.quiet_space_available || false,
              wheelchairAccessible: w.wheelchair_accessible || false,
              sensoryFriendlyHours: w.sensory_friendly_hours_available || false,
            },
            tags: w.sensory_features || [],
            listingType: "worship",
          }))
          setPlacesOfWorship(mappedWorship)
          console.log("[v0] Loaded places of worship from database:", mappedWorship.length)
        }

        const allParks = []
        if (parksResult.data) {
          allParks.push(
            ...parksResult.data.map((p: any) => ({
              id: p.id,
              name: p.name,
              description: p.description,
              category: "Park",
              city: p.city,
              address: p.address,
              rating: 4.7,
              imageUrl: p.images?.[0] || "/sensory-friendly-park.jpg",
              coordinates:
                p.latitude && p.longitude
                  ? { lat: Number.parseFloat(p.latitude), lng: Number.parseFloat(p.longitude) }
                  : null,
              sensoryAttributes: {
                noiseLevel: p.noise_level || "Moderate",
                lighting: "Natural",
                crowdDensity: p.crowd_level || "Low",
                hasQuietSpace: true,
                wheelchairAccessible: p.wheelchair_accessible || false,
                sensoryFriendlyHours: false,
              },
              tags: p.sensory_features || [],
              listingType: "park",
            })),
          )
        }
        if (playgroundsResult.data) {
          allParks.push(
            ...playgroundsResult.data.map((p: any) => ({
              id: p.id,
              name: p.name,
              description: p.description,
              category: "Playground",
              city: p.city,
              address: p.address,
              rating: 4.6,
              imageUrl: p.images?.[0] || "/sensory-friendly-playground.jpg",
              coordinates:
                p.latitude && p.longitude
                  ? { lat: Number.parseFloat(p.latitude), lng: Number.parseFloat(p.longitude) }
                  : null,
              sensoryAttributes: {
                noiseLevel: p.noise_level || "Moderate",
                lighting: "Natural",
                crowdDensity: p.crowd_level || "Low",
                hasQuietSpace: false,
                wheelchairAccessible: p.wheelchair_accessible || false,
                sensoryFriendlyHours: false,
              },
              tags: p.sensory_features || [],
              listingType: "playground",
            })),
          )
        }
        setParks(allParks)
        console.log("[v0] Loaded parks and playgrounds from database:", allParks.length)
      } catch (error) {
        console.error("[v0] Error fetching data:", error)
        setError("Failed to load listings. Please refresh the page.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    const params = new URLSearchParams(window.location.search)
    const q = params.get("q")

    if (q) {
      setSearchQuery(q)
      setShowSearchOverlay(true)
    }
  }, [])

  let filteredVenues = venues.filter(
    (venue) =>
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  if (locationPreferences.location) {
    filteredVenues = filterByDistance(filteredVenues, locationPreferences.location, locationPreferences.radius)
  }

  const activeEvents = filterActiveEvents(events)
  let filteredEvents = filterEventsByAge(activeEvents, userProfile.agePreference).filter(
    (event) =>
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venueName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  if (locationPreferences.location) {
    filteredEvents = filterByDistance(filteredEvents, locationPreferences.location, locationPreferences.radius)
  }

  let filteredWorship = placesOfWorship.filter(
    (place) =>
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  if (locationPreferences.location) {
    filteredWorship = filterByDistance(filteredWorship, locationPreferences.location, locationPreferences.radius)
  }

  let filteredParks = parks.filter(
    (park) =>
      park.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      park.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      park.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  if (locationPreferences.location) {
    filteredParks = filterByDistance(filteredParks, locationPreferences.location, locationPreferences.radius)
  }

  const getSensoryIcon = (type: string) => {
    switch (type) {
      case "noise":
        return <Volume2 className="h-3 w-3" />
      case "light":
        return <Sun className="h-3 w-3" />
      case "crowd":
        return <Users className="h-3 w-3" />
      default:
        return null
    }
  }

  const handleEventClick = (eventId: string, businessEmail?: string) => {
    if (businessEmail) {
      trackEventView(eventId, businessEmail)
      console.log("[v0] Tracked view click for event:", eventId)
    }
  }

  const mapMarkers = [
    ...filteredEvents.map((event) => ({
      id: event.id,
      name: event.name,
      coordinates: event.coordinates || { lat: 39.9526, lng: -75.1652 },
      type: "event" as const,
    })),
    ...filteredVenues
      .filter((venue) => venue.listingType !== "community")
      .map((venue) => ({
        id: venue.id,
        name: venue.name,
        coordinates: venue.coordinates || { lat: 39.9526, lng: -75.1652 },
        type: "venue" as const,
      })),
    ...filteredVenues
      .filter((venue) => venue.listingType === "community")
      .map((venue) => ({
        id: venue.id,
        name: venue.name,
        coordinates: venue.coordinates || { lat: 39.9526, lng: -75.1652 },
        type: "community" as const,
      })),
    ...filteredWorship.map((place) => ({
      id: place.id,
      name: place.name,
      coordinates: place.coordinates || { lat: 39.9526, lng: -75.1652 },
      type: "worship" as const,
    })),
    ...filteredParks.map((park) => ({
      id: park.id,
      name: park.name,
      coordinates: park.coordinates || { lat: 39.9526, lng: -75.1652 },
      type: "park" as const,
    })),
  ]

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold">Discover</h1>
          <p className="text-muted-foreground">Loading sensory-friendly places...</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          icon={MapPin}
          title="Unable to Load Listings"
          description={error}
          action={<Button onClick={() => window.location.reload()}>Retry</Button>}
        />
      </div>
    )
  }

  return (
    <>
      <EmailCaptureBanner />

      <div className="container mx-auto px-4 py-8">
        <ProfileBanner />

        <div className="mb-6 text-center">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-gradient text-balance">
            Find sensory-friendly events near you
          </h1>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground text-pretty">
            Explore welcoming activities designed for comfort. Match your family's needs for lighting, sound, and
            crowds.
          </p>
        </div>

        <div className="sticky top-14 z-30 mb-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-3 pt-2">
          <LocationSelector onLocationChange={setLocationPreferences} />
        </div>

        {locationPreferences.location && (
          <div className="mb-4 rounded-lg bg-primary/10 p-3 text-center">
            <p className="text-sm font-medium text-foreground">
              <span className="font-bold">
                {locationPreferences.radius} mi •{" "}
                {locationPreferences.location.zipCode || locationPreferences.location.city}
              </span>
            </p>
          </div>
        )}

        <Tabs defaultValue="events" className="space-y-4">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4">
            <TabsTrigger value="events" className="gap-2">
              Events
            </TabsTrigger>
            <TabsTrigger value="venues" className="gap-2">
              Venues
            </TabsTrigger>
            <TabsTrigger value="parks" className="gap-2">
              Parks
            </TabsTrigger>
            <TabsTrigger value="worship" className="gap-2">
              Worship
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-3">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {!locationPreferences.location ? (
                <EmptyState />
              ) : filteredEvents.length === 0 && events.length === 0 ? (
                <>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </>
              ) : (
                filteredEvents.map((event) => (
                  <Card key={event.id} className="flex flex-col group hover:shadow-lg transition-shadow">
                    <div className="relative aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={event.imageUrl || "/placeholder.svg?height=200&width=400&query=sensory-friendly-event"}
                        alt={event.name}
                        className="h-full w-full object-cover"
                      />
                      {"distance" in event && (
                        <Badge className="absolute left-3 top-3 bg-primary/90 text-primary-foreground backdrop-blur">
                          {event.distance} mi
                        </Badge>
                      )}
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg text-balance">{event.name}</CardTitle>
                        <FavoriteButton listingId={event.id} listingName={event.name} />
                      </div>
                      <CardDescription className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3" />
                          {event.venueName}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {new Date(event.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3" />
                          {event.time}
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>

                      <div className="flex flex-wrap gap-2">
                        {event.sensoryAttributes.noiseLevel === "Quiet" && (
                          <Badge variant="secondary" className="text-xs">
                            Quiet Hours
                          </Badge>
                        )}
                        {event.sensoryAttributes.lighting === "Soft" && (
                          <Badge variant="secondary" className="text-xs">
                            Low Lighting
                          </Badge>
                        )}
                        {event.registered < event.capacity * 0.5 && (
                          <Badge variant="secondary" className="text-xs">
                            Small Crowd
                          </Badge>
                        )}
                      </div>

                      <OpenInMapsButton address={`${event.venueName}, ${event.city || ""}`} />

                      <Button
                        className="w-full"
                        asChild
                        onClick={() => handleEventClick(event.id, event.businessEmail)}
                      >
                        <Link href={`/event/${event.id}`}>View Details</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {filteredEvents.length === 0 && events.length > 0 && locationPreferences.location && (
              <Card>
                <CardContent className="flex h-48 flex-col items-center justify-center gap-3 p-6">
                  <Calendar className="h-12 w-12 text-muted-foreground" />
                  <p className="text-center text-muted-foreground">
                    No events yet—try widening your radius or checking nearby dates.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="venues" className="space-y-3">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {!locationPreferences.location ? (
                <EmptyState />
              ) : filteredVenues.length === 0 && venues.length === 0 ? (
                <>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </>
              ) : (
                filteredVenues.map((venue) => (
                  <Link key={venue.id} href={`/venue/${venue.id}`} className="block">
                    <Card className="group h-full transition-all hover:shadow-lg relative">
                      <FavoriteButton
                        listingId={venue.id}
                        listingName={venue.name}
                        className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur"
                      />
                      <div className="relative aspect-video overflow-hidden rounded-t-lg">
                        <img
                          src={venue.imageUrl || "/placeholder.svg?height=200&width=400&query=sensory-friendly-venue"}
                          alt={venue.name}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                        <Badge className="absolute right-3 top-3 bg-card/90 text-card-foreground backdrop-blur">
                          {venue.category}
                        </Badge>
                        {"distance" in venue && (
                          <Badge className="absolute left-3 top-3 bg-primary/90 text-primary-foreground backdrop-blur">
                            {venue.distance} mi
                          </Badge>
                        )}
                        {venue.listingType === "community" && (
                          <Badge className="absolute left-3 bottom-3 bg-accent/90 text-accent-foreground backdrop-blur gap-1">
                            <MapPin className="h-3 w-3" />
                            Community Venue
                          </Badge>
                        )}
                      </div>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-lg text-balance">{venue.name}</CardTitle>
                          <div className="flex items-center gap-1 text-sm font-medium">
                            <Star className="h-4 w-4 fill-accent text-accent" />
                            {venue.rating}
                          </div>
                        </div>
                        <CardDescription className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3" />
                          {venue.city}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{venue.description}</p>

                        <div className="mb-3 flex flex-wrap gap-2">
                          <Badge variant="outline" className="gap-1 text-xs">
                            <Volume2 className="h-3 w-3" />
                            {venue.sensoryAttributes.noiseLevel}
                          </Badge>
                          <Badge variant="outline" className="gap-1 text-xs">
                            <Sun className="h-3 w-3" />
                            {venue.sensoryAttributes.lighting}
                          </Badge>
                          <Badge variant="outline" className="gap-1 text-xs">
                            <Users className="h-3 w-3" />
                            {venue.sensoryAttributes.crowdDensity}
                          </Badge>
                        </div>

                        <div className="mb-3 flex flex-wrap gap-1">
                          {venue.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <OpenInMapsButton address={`${venue.address}, ${venue.city || ""}`} />
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>

            {filteredVenues.length === 0 && venues.length > 0 && locationPreferences.location && (
              <Card>
                <CardContent className="flex h-48 items-center justify-center p-6">
                  <p className="text-muted-foreground">
                    No venues found within {locationPreferences.radius} miles. Try widening your search radius.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="parks" className="space-y-3">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {!locationPreferences.location ? (
                <EmptyState />
              ) : filteredParks.length === 0 && parks.length === 0 ? (
                <>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </>
              ) : (
                filteredParks.map((park) => (
                  <Link key={park.id} href={`/venue/${park.id}`} className="block">
                    <Card className="group h-full transition-all hover:shadow-lg relative">
                      <div className="absolute top-2 right-2 z-10 flex gap-2">
                        <Badge className="bg-green-500 text-white">FREE</Badge>
                        <FavoriteButton
                          listingId={park.id}
                          listingName={park.name}
                          className="bg-background/80 backdrop-blur"
                        />
                      </div>
                      <div className="relative aspect-video overflow-hidden rounded-t-lg">
                        <img
                          src={park.imageUrl || "/placeholder.svg"}
                          alt={park.name}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                        {"distance" in park && (
                          <Badge className="absolute left-3 bottom-3 bg-primary/90 text-primary-foreground backdrop-blur">
                            {park.distance} mi
                          </Badge>
                        )}
                      </div>
                      <CardHeader>
                        <CardTitle className="text-lg text-balance">{park.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {park.city}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-2">{park.description}</p>

                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {park.category}
                          </Badge>
                          {park.sensoryAttributes.noiseLevel === "Quiet" && (
                            <Badge variant="secondary" className="text-xs">
                              Quiet Space
                            </Badge>
                          )}
                          {park.sensoryAttributes.hasQuietSpace && (
                            <Badge variant="secondary" className="text-xs">
                              Natural Setting
                            </Badge>
                          )}
                          {park.sensoryAttributes.wheelchairAccessible && (
                            <Badge variant="secondary" className="text-xs">
                              Accessible
                            </Badge>
                          )}
                        </div>

                        <OpenInMapsButton address={`${park.address}, ${park.city || ""}`} />
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>

            {filteredParks.length === 0 && parks.length > 0 && locationPreferences.location && (
              <Card>
                <CardContent className="flex h-48 flex-col items-center justify-center gap-3 p-6">
                  <Trees className="h-12 w-12 text-muted-foreground" />
                  <p className="text-center text-muted-foreground">
                    No parks or playgrounds found in your area—try expanding your search radius.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="worship" className="space-y-3">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {!locationPreferences.location ? (
                <EmptyState />
              ) : filteredWorship.length === 0 && placesOfWorship.length === 0 ? (
                <>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </>
              ) : (
                filteredWorship.map((place) => (
                  <Link key={place.id} href={`/venue/${place.id}`} className="block">
                    <Card className="group h-full transition-all hover:shadow-lg relative">
                      <div className="absolute top-2 right-2 z-10 flex gap-2">
                        <Badge className="bg-green-500 text-white">FREE</Badge>
                        <FavoriteButton
                          listingId={place.id}
                          listingName={place.name}
                          className="bg-background/80 backdrop-blur"
                        />
                      </div>
                      <div className="relative aspect-video overflow-hidden rounded-t-lg">
                        <img
                          src={place.imageUrl || "/act-of-worship.png"}
                          alt={place.name}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                        {"distance" in place && (
                          <Badge className="absolute left-3 bottom-3 bg-primary/90 text-primary-foreground backdrop-blur">
                            {place.distance} mi
                          </Badge>
                        )}
                      </div>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-lg text-balance">{place.name}</CardTitle>
                          <div className="flex items-center gap-1 text-sm font-medium">
                            <Star className="h-4 w-4 fill-accent text-accent" />
                            {place.rating}
                          </div>
                        </div>
                        <CardDescription className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3" />
                          {place.city}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-2">{place.description}</p>

                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {place.category}
                          </Badge>
                          {place.sensoryAttributes.noiseLevel === "Quiet" && (
                            <Badge variant="secondary" className="text-xs">
                              Quiet Space
                            </Badge>
                          )}
                          {place.sensoryAttributes.hasQuietSpace && (
                            <Badge variant="secondary" className="text-xs">
                              Natural Setting
                            </Badge>
                          )}
                          {place.sensoryAttributes.wheelchairAccessible && (
                            <Badge variant="secondary" className="text-xs">
                              Accessible
                            </Badge>
                          )}
                        </div>

                        <OpenInMapsButton address={`${place.address}, ${place.city || ""}`} />
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>

            {filteredWorship.length === 0 && placesOfWorship.length > 0 && locationPreferences.location && (
              <Card>
                <CardContent className="flex h-48 flex-col items-center justify-center gap-3 p-6">
                  <Building2 className="h-12 w-12 text-muted-foreground" />
                  <p className="text-center text-muted-foreground">
                    No places of worship found in your area—try expanding your search radius.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
