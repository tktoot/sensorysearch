"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Volume2,
  Sun,
  Heart,
  Share2,
  ArrowLeft,
  ExternalLink,
  Accessibility,
} from "lucide-react"
import { mockEvents, mockVenues, type Event } from "@/lib/mock-data"
import { trackEventView, addUserFavorite, removeUserFavorite, isEventFavorited } from "@/lib/analytics"
import { eventToCalendarEvent } from "@/lib/calendar-utils"
import { AddToCalendarDropdown } from "@/components/add-to-calendar-dropdown"
import Link from "next/link"
import { ExperienceSlider } from "@/components/experience-slider"
import { FeedbackForm } from "@/components/feedback-form"

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      const foundEvent = mockEvents.find((e) => e.id === params.id)
      setEvent(foundEvent || null)
      setLoading(false)

      if (foundEvent && foundEvent.businessEmail) {
        trackEventView(foundEvent.id, foundEvent.businessEmail)
        console.log("[v0] Tracked view for event:", foundEvent.id)
      }

      if (foundEvent) {
        setIsSaved(isEventFavorited(foundEvent.id))
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [params.id])

  const handleSave = () => {
    if (!event || !event.businessEmail) return

    if (isSaved) {
      removeUserFavorite(event.id, event.businessEmail)
      setIsSaved(false)
      console.log("[v0] Removed favorite for event:", event.id)
    } else {
      addUserFavorite(event.id, event.businessEmail)
      setIsSaved(true)
      console.log("[v0] Added favorite for event:", event.id)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.name,
          text: event?.description,
          url: window.location.href,
        })
      } catch (err) {
        console.log("Share cancelled")
      }
    } else {
      // Fallback: copy to clipboard
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

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center gap-4 p-12">
            <Calendar className="h-16 w-16 text-muted-foreground" />
            <h2 className="text-2xl font-bold text-center">Event Not Found</h2>
            <p className="text-center text-muted-foreground">
              The event you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => router.push("/discover")}>Back to Discover</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const venue = mockVenues.find((v) => v.id === event.venueId)
  const calendarEvent = eventToCalendarEvent(event)

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
              src={event.imageUrl || "/placeholder.svg?height=400&width=800&query=sensory-friendly-event"}
              alt={event.name}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Title & Basic Info */}
          <div>
            <h1 className="text-3xl font-bold mb-4 text-balance">{event.name}</h1>

            <div className="space-y-2 text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <Link href={`/venue/${event.venueId}`} className="hover:underline text-foreground font-medium">
                  {event.venueName}
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-2"
                  onClick={() => openInMaps(event.venueName)}
                >
                  <ExternalLink className="h-3 w-3" />
                  <span className="sr-only">Open in maps</span>
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(event.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{event.time}</span>
                <AddToCalendarDropdown
                  event={calendarEvent}
                  variant="outline"
                  size="sm"
                  className="ml-2 bg-transparent"
                />
              </div>

              {event.crowdLevel ? (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>
                    Crowd level: <span className="capitalize font-medium">{event.crowdLevel}</span>
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="text-muted-foreground">Crowd level: Not specified</span>
                </div>
              )}
              {event.crowdLevel && (
                <p className="text-xs text-muted-foreground ml-6">Crowd level is organizer-provided and may vary.</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold mb-3">About This Event</h2>
            <p className="text-muted-foreground leading-relaxed">{event.description}</p>
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
                    <p className="text-sm text-muted-foreground capitalize">{event.sensoryAttributes.noiseLevel}</p>
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
                    <p className="text-sm text-muted-foreground capitalize">{event.sensoryAttributes.lighting}</p>
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
                    <p className="text-sm text-muted-foreground capitalize">{event.sensoryAttributes.crowdDensity}</p>
                  </div>
                </CardContent>
              </Card>

              {event.sensoryAttributes.hasQuietSpace && (
                <Card>
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Accessibility className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Quiet Space Available</p>
                      <p className="text-sm text-muted-foreground">Yes</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <Separator />

          {/* Experience Slider for user feedback */}
          <ExperienceSlider listingId={event.id} listingType="event" />

          <Separator />

          {/* Feedback Form */}
          <FeedbackForm listingId={event.id} listingType="event" organizerUserId={event.businessEmail} />

          <Separator />

          {/* Age Range & Tags */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Details</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium mb-2">Age Range</p>
                <Badge variant="secondary">
                  {event.ageRange.min === 0 && event.ageRange.max === 99
                    ? "All Ages"
                    : `${event.ageRange.min}-${event.ageRange.max} years`}
                </Badge>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {event.sensoryAttributes.wheelchairAccessible && (
                <div>
                  <p className="text-sm font-medium mb-2">Accessibility</p>
                  <Badge variant="secondary" className="gap-1">
                    <Accessibility className="h-3 w-3" />
                    Wheelchair Accessible
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Action Buttons */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <Button variant="outline" className="w-full gap-2 bg-transparent" onClick={handleSave}>
                <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                {isSaved ? "Saved" : "Save Event"}
              </Button>

              <Button variant="outline" className="w-full gap-2 bg-transparent" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </CardContent>
          </Card>

          {/* Venue Info */}
          {venue && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Venue</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href={`/venue/${venue.id}`} className="group">
                  <div className="relative aspect-video overflow-hidden rounded-lg mb-3">
                    <img
                      src={venue.imageUrl || "/placeholder.svg?height=200&width=400&query=venue"}
                      alt={venue.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <h3 className="font-semibold group-hover:underline">{venue.name}</h3>
                  <p className="text-sm text-muted-foreground">{venue.city}</p>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
