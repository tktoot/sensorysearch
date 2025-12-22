"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Star, Volume2, Sun, Users, Calendar, Clock } from 'lucide-react'
import {
  filterEventsByAge,
  filterActiveEvents,
  type UserProfile,
  type Venue,
  type Event,
} from "@/lib/mock-data"
import { trackEventView } from "@/lib/analytics"
import Link from "next/link"
import { ProfileBanner } from "@/components/profile-banner"
import { LocationSelector } from "@/components/location-selector"
import { filterByDistance, type LocationPreferences } from "@/lib/location-utils"
import { FavoriteButton } from "@/components/favorite-button"
import { EmptyState } from "@/components/empty-state"
import { SkeletonCard } from "@/components/skeleton-card"
import { OpenInMapsButton } from "@/components/open-in-maps-button"
import { createClient } from "@/lib/supabase/client"

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
  const [showSearchOverlay, setShowSearchOverlay] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile")
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile))
    }

    const fetchApprovedListings = async () => {
      try {
        console.log("[v0] DISCOVER_FETCH: Fetching approved listings from Supabase...")
        const supabase = createClient()
        
        const { data, error } = await supabase
          .from("listings")
          .select("*")
          .eq("status", "approved")
          .order("submitted_at", { ascending: false })

        if (error) {
          console.error("[v0] DISCOVER_FETCH_ERROR:", error)
          setLoading(false)
          return
        }

        console.log("[v0] DISCOVER_FETCH_SUCCESS:", {
          total: data?.length || 0,
          venues: data?.filter(d => d.type === 'venue').length || 0,
          events: data?.filter(d => d.type === 'event').length || 0,
        })

        const approvedVenues: Venue[] = data
          .filter(item => item.type === 'venue')
          .map(item => ({
            id: item.id,
            name: item.title,
            description: item.description,
            category: item.sensory_features?.includes('lowNoise') ? 'Quiet Space' : 'Indoor',
            address: item.address,
            city: item.city,
            state: item.state,
            coordinates: item.coordinates || { lat: 0, lng: 0 },
            rating: 4.5,
            imageUrl: item.images?.[0] || '/placeholder.svg',
            sensoryAttributes: {
              noiseLevel: item.sensory_features?.includes('lowNoise') ? 'Quiet' : 'Moderate',
              lighting: item.sensory_features?.includes('gentleLighting') ? 'Soft' : 'Natural',
              crowdDensity: item.sensory_features?.includes('crowdManaged') ? 'Low' : 'Moderate',
            },
            tags: item.sensory_features || [],
            listingType: 'business',
          }))

        const approvedEvents: Event[] = data
          .filter(item => item.type === 'event')
          .map(item => ({
            id: item.id,
            name: item.title,
            description: item.description,
            venueName: item.title,
            city: item.city,
            date: item.event_date || new Date().toISOString(),
            time: item.event_start_time || '10:00 AM',
            capacity: 50,
            registered: 0,
            imageUrl: item.images?.[0] || '/placeholder.svg',
            coordinates: item.coordinates || { lat: 0, lng: 0 },
            sensoryAttributes: {
              noiseLevel: item.sensory_features?.includes('lowNoise') ? 'Quiet' : 'Moderate',
              lighting: item.sensory_features?.includes('gentleLighting') ? 'Soft' : 'Natural',
              crowdDensity: item.sensory_features?.includes('crowdManaged') ? 'Low' : 'Moderate',
            },
            tags: item.sensory_features || [],
            ageGroups: ['all ages'],
          }))

        setVenues(approvedVenues)
        setEvents(approvedEvents)

        console.log("[v0] DISCOVER_LOADED - Loaded from Supabase:", {
          venues: approvedVenues.length,
          events: approvedEvents.length
        })
      } catch (err) {
        console.error("[v0] DISCOVER_FETCH_FAILED:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchApprovedListings()

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
      coordinates: event.coordinates || { lat: 39.9526, lng: -75.1652 }, // Fallback to Philadelphia
      type: "event" as const,
    })),
    ...filteredVenues
      .filter((venue) => venue.listingType !== "community")
      .map((venue) => ({
        id: venue.id,
        name: venue.name,
        coordinates: venue.coordinates || { lat: 39.9526, lng: -75.1652 }, // Fallback to Philadelphia
        type: "venue" as const,
      })),
    ...filteredVenues
      .filter((venue) => venue.listingType === "community")
      .map((venue) => ({
        id: venue.id,
        name: venue.name,
        coordinates: venue.coordinates || { lat: 39.9526, lng: -75.1652 }, // Fallback to Philadelphia
        type: "community" as const,
      })),
  ]

  return (
    <>
      <ProfileBanner />

      <div className="container mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-gradient text-balance">
            Find sensory-friendly events near you
          </h1>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground text-pretty">
            Explore welcoming activities designed for comfort. Match your family's needs for lighting, sound, and
            crowds.
          </p>
        </div>

        {/* Location Selector - Compact */}
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

        {/* Tabs for Events and Venues */}
        <Tabs defaultValue="events" className="space-y-4">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="events" className="gap-2">
              Events
            </TabsTrigger>
            <TabsTrigger value="venues" className="gap-2">
              Venues
            </TabsTrigger>
          </TabsList>

          {/* Events Tab */}
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

          {/* Venues Tab */}
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

                        <div className="mb-3 flex flex-wrap gap-2">
                          {venue.sensoryAttributes.noiseLevel === "Quiet" && (
                            <Badge variant="secondary" className="text-xs">
                              Calm
                            </Badge>
                          )}
                          {venue.sensoryAttributes.lighting === "Soft" && (
                            <Badge variant="secondary" className="text-xs">
                              Soft lighting
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1">
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
        </Tabs>
      </div>
    </>
  )
}
