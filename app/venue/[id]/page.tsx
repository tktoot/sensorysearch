"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  MapPin,
  Phone,
  Globe,
  Heart,
  Share2,
  ArrowLeft,
  ExternalLink,
  Star,
  Volume2,
  Sun,
  Users,
  Accessibility,
  Calendar,
  Clock,
} from "lucide-react"
import type { Venue } from "@/lib/mock-data"
import Link from "next/link"
import { ExperienceSlider } from "@/components/experience-slider"
import { FeedbackForm } from "@/components/feedback-form"
import { createBrowserClient } from "@/lib/supabase-browser-client"

export default function VenueDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [venue, setVenue] = useState<Venue | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])

  useEffect(() => {
    async function fetchVenue() {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        )

        const { data: venueData, error } = await supabase.from("venues").select("*").eq("id", params.id).single()

        if (error || !venueData) {
          console.error("[v0] Error fetching venue:", error)
          setVenue(null)
          setLoading(false)
          return
        }

        const mappedVenue: Venue = {
          id: venueData.id,
          name: venueData.name,
          description: venueData.description,
          category: venueData.category || "Other",
          city: venueData.city,
          address: venueData.address,
          rating: 4.5,
          imageUrl: venueData.hero_image_url || venueData.photo_urls?.[0] || "/elegant-wedding-venue.png",
          coordinates:
            venueData.latitude && venueData.longitude
              ? { lat: Number.parseFloat(venueData.latitude), lng: Number.parseFloat(venueData.longitude) }
              : null,
          sensoryAttributes: {
            noiseLevel: venueData.noise_level || "moderate",
            lighting: venueData.lighting_level || "natural",
            crowdDensity: venueData.crowd_level || "moderate",
            hasQuietSpace: venueData.quiet_space_available || false,
            wheelchairAccessible: venueData.wheelchair_accessible || false,
            sensoryFriendlyHours: venueData.sensory_friendly_hours_available || false,
          },
          tags: venueData.sensory_features || [],
          listingType: "business",
        }

        setVenue(mappedVenue)

        // Check if venue is saved
        const savedVenues = JSON.parse(localStorage.getItem("savedVenues") || "[]")
        setIsSaved(savedVenues.includes(params.id))

        // Fetch upcoming events at this venue
        const { data: eventsData } = await supabase
          .from("events")
          .select("*")
          .eq("venue_id", params.id)
          .gte("event_date", new Date().toISOString().split("T")[0])
          .order("event_date", { ascending: true })
          .limit(4)

        if (eventsData) {
          setUpcomingEvents(eventsData)
        }
      } catch (error) {
        console.error("[v0] Error fetching venue:", error)
        setVenue(null)
      } finally {
        setLoading(false)
      }
    }

    fetchVenue()
  }, [params.id])

  const handleSave = () => {
    const savedVenues = JSON.parse(localStorage.getItem("savedVenues") || "[]")
    if (isSaved) {
      const updated = savedVenues.filter((id: string) => id !== params.id)
      localStorage.setItem("savedVenues", JSON.stringify(updated))
      setIsSaved(false)
    } else {
      savedVenues.push(params.id)
      localStorage.setItem("savedVenues", JSON.stringify(savedVenues))
      setIsSaved(true)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: venue?.name,
          text: venue?.description,
          url: window.location.href,
        })
      } catch (err) {
        console.log("Share cancelled")
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  const openInMaps = (address: string) => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    window.open(mapsUrl, "_blank")
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="h-10 w-32 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-video bg-muted rounded-lg animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 w-3/4 bg-muted rounded animate-pulse" />
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-64 bg-muted rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!venue) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center gap-4 p-12">
            <MapPin className="h-16 w-16 text-muted-foreground" />
            <h2 className="text-2xl font-bold text-center">Venue Not Found</h2>
            <p className="text-center text-muted-foreground">
              The venue you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => router.push("/discover")}>Back to Discover</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.back()} className="mb-6 gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Image */}
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <img
              src={venue.imageUrl || "/placeholder.svg?height=400&width=800&query=sensory-friendly-venue"}
              alt={venue.name}
              className="h-full w-full object-cover"
            />
            <Badge className="absolute right-4 top-4 bg-card/90 text-card-foreground backdrop-blur">
              {venue.category}
            </Badge>
          </div>

          {/* Title & Basic Info */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-3xl font-bold text-balance">{venue.name}</h1>
              <div className="flex items-center gap-1 text-lg font-semibold">
                <Star className="h-5 w-5 fill-accent text-accent" />
                {venue.rating}
              </div>
            </div>

            <div className="space-y-2 text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>
                  {venue.address}, {venue.city}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-2"
                  onClick={() => openInMaps(`${venue.address}, ${venue.city}`)}
                >
                  <ExternalLink className="h-3 w-3" />
                  <span className="sr-only">Open in maps</span>
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>(555) 123-4567</span>
              </div>

              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <a href="#" className="hover:underline text-foreground">
                  Visit Website
                </a>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold mb-3">About</h2>
            <p className="text-muted-foreground leading-relaxed">{venue.description}</p>
          </div>

          <Separator />

          {/* What to Expect */}
          <div>
            <h2 className="text-xl font-semibold mb-4">What to Expect</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>
                This venue has been reviewed and rated by our community for its sensory-friendly features. You can
                expect a welcoming environment with staff trained to accommodate various sensory needs.
              </p>
              <p>
                {venue.sensoryAttributes.hasQuietSpace &&
                  "A dedicated quiet room is available for those who need a break from stimulation. "}
                {venue.sensoryAttributes.sensoryFriendlyHours &&
                  "Special sensory-friendly hours are offered with reduced noise and lighting. "}
                {venue.sensoryAttributes.wheelchairAccessible && "The venue is fully wheelchair accessible."}
              </p>
            </div>
          </div>

          <Separator />

          {/* Sensory Features */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Sensory Features</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Volume2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Noise Level</p>
                    <p className="text-sm text-muted-foreground capitalize">{venue.sensoryAttributes.noiseLevel}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Sun className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Lighting</p>
                    <p className="text-sm text-muted-foreground capitalize">{venue.sensoryAttributes.lighting}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Crowd Density</p>
                    <p className="text-sm text-muted-foreground capitalize">{venue.sensoryAttributes.crowdDensity}</p>
                  </div>
                </CardContent>
              </Card>

              {venue.sensoryAttributes.hasQuietSpace && (
                <Card>
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Accessibility className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Quiet Room</p>
                      <p className="text-sm text-muted-foreground">Available</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <Separator />

          {/* Experience Slider for user feedback */}
          <ExperienceSlider listingId={venue.id} listingType="venue" />

          <Separator />

          {/* Feedback Form */}
          <FeedbackForm listingId={venue.id} listingType="venue" />

          <Separator />

          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <>
              <div>
                <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {upcomingEvents.map((event) => (
                    <Link key={event.id} href={`/event/${event.id}`}>
                      <Card className="group h-full transition-all hover:shadow-lg">
                        <div className="relative aspect-video overflow-hidden rounded-t-lg">
                          <img
                            src={event.images?.[0] || "/community-event.png"}
                            alt={event.name}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                        <CardHeader>
                          <CardTitle className="text-base text-balance">{event.name}</CardTitle>
                          <CardDescription className="space-y-1">
                            <div className="flex items-center gap-1 text-xs">
                              <Calendar className="h-3 w-3" />
                              {new Date(event.event_date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <Clock className="h-3 w-3" />
                              {event.event_start_time || "TBD"}
                            </div>
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Action Buttons */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <Button className="w-full gap-2" size="lg" onClick={() => openInMaps(`${venue.address}, ${venue.city}`)}>
                <MapPin className="h-4 w-4" />
                Open in Maps
              </Button>

              <Button variant="outline" className="w-full gap-2 bg-transparent" onClick={handleSave}>
                <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                {isSaved ? "Saved" : "Save Venue"}
              </Button>

              <Button variant="outline" className="w-full gap-2 bg-transparent" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {venue.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
