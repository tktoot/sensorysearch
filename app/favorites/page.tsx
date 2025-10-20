"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, MapPin, Calendar, Clock, Volume2, Sun, Users } from "lucide-react"
import { mockEvents, mockVenues, type Event, type Venue } from "@/lib/mock-data"
import { getGuestFavorites } from "@/lib/guest-store"
import { FavoriteButton } from "@/components/favorite-button"
import Link from "next/link"

export default function FavoritesPage() {
  const [favoriteEvents, setFavoriteEvents] = useState<Event[]>([])
  const [favoriteVenues, setFavoriteVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const favoriteIds = getGuestFavorites()

    const storedEvents = localStorage.getItem("events")
    const storedVenues = localStorage.getItem("venues")

    const allEvents = storedEvents ? JSON.parse(storedEvents) : mockEvents
    const allVenues = storedVenues ? JSON.parse(storedVenues) : mockVenues

    const events = allEvents.filter((event: Event) => favoriteIds.includes(event.id))
    const venues = allVenues.filter((venue: Venue) => favoriteIds.includes(venue.id))

    setFavoriteEvents(events)
    setFavoriteVenues(venues)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="h-10 w-64 bg-muted rounded animate-pulse mb-3" />
          <div className="h-6 w-96 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-full">
              <div className="aspect-video bg-muted rounded-t-lg animate-pulse" />
              <CardHeader>
                <div className="h-6 w-3/4 bg-muted rounded animate-pulse mb-2" />
                <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const totalFavorites = favoriteEvents.length + favoriteVenues.length

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-foreground">My Favorites</h1>
        <p className="text-lg text-muted-foreground">
          {totalFavorites > 0
            ? `${totalFavorites} saved ${totalFavorites === 1 ? "item" : "items"}`
            : "Your saved sensory-friendly events and venues"}
        </p>
      </div>

      {totalFavorites > 0 ? (
        <>
          {favoriteEvents.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">Events</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {favoriteEvents.map((event) => (
                  <Card key={event.id} className="flex flex-col">
                    <div className="relative aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={event.imageUrl || "/placeholder.svg?height=200&width=400&query=sensory-friendly-event"}
                        alt={event.name}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute right-2 top-2">
                        <FavoriteButton
                          listingId={event.id}
                          listingName={event.name}
                          className="bg-white/90 hover:bg-white"
                        />
                      </div>
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

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="gap-1 text-xs">
                          <Volume2 className="h-3 w-3" />
                          {event.sensoryAttributes.noiseLevel}
                        </Badge>
                        <Badge variant="outline" className="gap-1 text-xs">
                          <Sun className="h-3 w-3" />
                          {event.sensoryAttributes.lighting}
                        </Badge>
                        {event.capacity && (
                          <Badge variant="outline" className="gap-1 text-xs">
                            <Users className="h-3 w-3" />
                            {event.registered}/{event.capacity}
                          </Badge>
                        )}
                      </div>

                      <Button className="w-full" asChild>
                        <Link href={`/event/${event.id}`}>View Details</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {favoriteVenues.length > 0 && (
            <div>
              <h2 className="mb-4 text-2xl font-semibold">Venues</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {favoriteVenues.map((venue) => (
                  <Card key={venue.id} className="flex flex-col">
                    <div className="relative aspect-video overflow-hidden rounded-t-lg">
                      <img
                        src={venue.imageUrl || "/placeholder.svg?height=200&width=400&query=sensory-friendly-venue"}
                        alt={venue.name}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute right-2 top-2">
                        <FavoriteButton
                          listingId={venue.id}
                          listingName={venue.name}
                          className="bg-white/90 hover:bg-white"
                        />
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg text-balance">{venue.name}</CardTitle>
                      <CardDescription className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3" />
                          {venue.city}, {venue.address}
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-3">{venue.description}</p>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="gap-1 text-xs">
                          <Volume2 className="h-3 w-3" />
                          {venue.sensoryAttributes.noiseLevel}
                        </Badge>
                        <Badge variant="outline" className="gap-1 text-xs">
                          <Sun className="h-3 w-3" />
                          {venue.sensoryAttributes.lighting}
                        </Badge>
                      </div>

                      <Button className="w-full" asChild>
                        <Link href={`/venue/${venue.id}`}>View Details</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="flex h-64 flex-col items-center justify-center gap-3 p-6">
            <Heart className="h-16 w-16 text-muted-foreground" />
            <p className="text-center text-lg text-muted-foreground">No favorites yet</p>
            <p className="text-center text-sm text-muted-foreground">
              Start exploring and save your favorite sensory-friendly events and venues
            </p>
            <Button asChild>
              <Link href="/discover">Discover Events</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
