"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Users, Volume2, Sun, Info } from "lucide-react"
import Link from "next/link"
import { createBrowserClient } from "@/lib/supabase-browser-client"

type UserProfile = {
  agePreference: "toddlers" | "children" | "teens" | "adults" | null
}

function filterEventsByAge(events: any[], agePreference: UserProfile["agePreference"]): any[] {
  if (!agePreference) return events

  const ageRanges = {
    toddlers: { min: 0, max: 5 },
    children: { min: 6, max: 12 },
    teens: { min: 13, max: 17 },
    adults: { min: 18, max: 99 },
  }

  const userRange = ageRanges[agePreference]
  if (!userRange) return events

  return events.filter((event) => {
    if (!event.min_age || !event.max_age) return true
    return userRange.min <= event.max_age && userRange.max >= event.min_age
  })
}

export default function EventsPage() {
  const [userProfile, setUserProfile] = useState<UserProfile>({ agePreference: null })
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile")
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile))
    }

    async function fetchEvents() {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        )

        const { data: eventsData, error } = await supabase
          .from("events")
          .select("*")
          .gte("event_date", new Date().toISOString().split("T")[0])
          .order("event_date", { ascending: true })

        if (error) {
          console.error("[v0] Error fetching events:", error)
          setEvents([])
        } else if (eventsData) {
          const mapped = eventsData.map((e: any) => ({
            id: e.id,
            name: e.name,
            description: e.description,
            venueName: e.venue_name || e.address,
            date: e.event_date,
            time: e.event_start_time || "TBD",
            imageUrl: e.images?.[0] || e.hero_image_url || "/placeholder.svg",
            capacity: e.capacity || 50,
            registered: 0,
            min_age: e.min_age,
            max_age: e.max_age,
            sensoryAttributes: {
              noiseLevel: e.noise_level || "Quiet",
              lighting: e.lighting || "Soft",
            },
            tags: e.sensory_features || [],
          }))
          setEvents(mapped)
        }
      } catch (error) {
        console.error("[v0] Error:", error)
        setEvents([])
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const filteredEvents = filterEventsByAge(events, userProfile.agePreference)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-gradient">Sensory-Friendly Events</h1>
        <p className="max-w-2xl text-lg text-muted-foreground text-pretty">
          Discover upcoming events designed with sensory considerations in mind. Small groups, calm environments, and
          flexible participation.
        </p>
      </div>

      {userProfile.agePreference && (
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="flex items-center gap-3 p-4">
            <Info className="h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm text-foreground">
              Showing events for <span className="font-semibold">{userProfile.agePreference}</span>.{" "}
              <Link href="/profile" className="text-primary underline-offset-4 hover:underline">
                Change age preference
              </Link>
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="flex flex-col">
            <div className="relative aspect-video overflow-hidden rounded-t-lg">
              <img src={event.imageUrl || "/placeholder.svg"} alt={event.name} className="h-full w-full object-cover" />
            </div>
            <CardHeader>
              <CardTitle className="text-lg text-balance">{event.name}</CardTitle>
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
            <CardContent className="flex-1 space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">{event.description}</p>

              {/* Sensory Attributes */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="gap-1 text-xs">
                  <Volume2 className="h-3 w-3" />
                  {event.sensoryAttributes.noiseLevel}
                </Badge>
                <Badge variant="outline" className="gap-1 text-xs">
                  <Sun className="h-3 w-3" />
                  {event.sensoryAttributes.lighting}
                </Badge>
                <Badge variant="outline" className="gap-1 text-xs">
                  <Users className="h-3 w-3" />
                  {event.registered}/{event.capacity}
                </Badge>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {event.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <Button className="w-full" asChild>
                <Link href={`/events/${event.id}`}>View Details</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <Card>
          <CardContent className="flex h-48 flex-col items-center justify-center gap-3 p-6">
            <Calendar className="h-12 w-12 text-muted-foreground" />
            <p className="text-center text-muted-foreground">
              No events found for your age preference. Try adjusting your profile settings.
            </p>
            <Button asChild>
              <Link href="/profile">Update Age Preference</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
