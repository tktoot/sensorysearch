import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Star, Volume2, Sun, Users, Heart, Share2, Clock, DollarSign, Accessibility } from "lucide-react"
import { mockVenues } from "@/lib/mock-data"

export function generateStaticParams() {
  return mockVenues.map((venue) => ({
    id: venue.id,
  }))
}

export default function VenuePage({ params }: { params: { id: string } }) {
  const venue = mockVenues.find((v) => v.id === params.id)

  if (!venue) {
    notFound()
  }

  const getSensoryLevel = (level: string) => {
    const colors = {
      quiet: "text-primary",
      moderate: "text-accent",
      loud: "text-destructive",
      dim: "text-primary",
      natural: "text-primary",
      bright: "text-accent",
      low: "text-primary",
      medium: "text-accent",
      high: "text-destructive",
    }
    return colors[level as keyof typeof colors] || "text-foreground"
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Image */}
      <div className="relative mb-8 aspect-[21/9] overflow-hidden rounded-xl">
        <img src={venue.imageUrl || "/placeholder.svg"} alt={venue.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <Badge className="mb-3">{venue.category}</Badge>
          <h1 className="mb-2 text-4xl font-bold text-card text-balance">{venue.name}</h1>
          <div className="flex items-center gap-4 text-card">
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 fill-accent text-accent" />
              <span className="font-semibold">{venue.rating}</span>
              <span className="text-sm">({venue.reviewCount} reviews)</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">
                {venue.address}, {venue.city}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>About This Venue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{venue.description}</p>
            </CardContent>
          </Card>

          {/* Sensory Information */}
          <Card>
            <CardHeader>
              <CardTitle>Sensory Information</CardTitle>
              <CardDescription>Detailed sensory attributes to help you prepare for your visit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Volume2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Noise Level</p>
                    <p className="text-sm text-muted-foreground">Sound environment</p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`${getSensoryLevel(venue.sensoryAttributes.noiseLevel)} capitalize`}
                >
                  {venue.sensoryAttributes.noiseLevel}
                </Badge>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Sun className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Lighting</p>
                    <p className="text-sm text-muted-foreground">Light intensity</p>
                  </div>
                </div>
                <Badge variant="outline" className={`${getSensoryLevel(venue.sensoryAttributes.lighting)} capitalize`}>
                  {venue.sensoryAttributes.lighting}
                </Badge>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Crowd Density</p>
                    <p className="text-sm text-muted-foreground">Typical occupancy</p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`${getSensoryLevel(venue.sensoryAttributes.crowdDensity)} capitalize`}
                >
                  {venue.sensoryAttributes.crowdDensity}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Accessibility Features */}
          <Card>
            <CardHeader>
              <CardTitle>Accessibility Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Accessibility
                  className={`h-5 w-5 ${venue.sensoryAttributes.wheelchairAccessible ? "text-primary" : "text-muted-foreground"}`}
                />
                <span
                  className={venue.sensoryAttributes.wheelchairAccessible ? "text-foreground" : "text-muted-foreground"}
                >
                  Wheelchair Accessible
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Clock
                  className={`h-5 w-5 ${venue.sensoryAttributes.sensoryFriendlyHours ? "text-primary" : "text-muted-foreground"}`}
                />
                <span
                  className={venue.sensoryAttributes.sensoryFriendlyHours ? "text-foreground" : "text-muted-foreground"}
                >
                  Sensory-Friendly Hours Available
                </span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin
                  className={`h-5 w-5 ${venue.sensoryAttributes.hasQuietSpace ? "text-primary" : "text-muted-foreground"}`}
                />
                <span className={venue.sensoryAttributes.hasQuietSpace ? "text-foreground" : "text-muted-foreground"}>
                  Quiet Space Available
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <Button className="w-full" size="lg">
                <Heart className="mr-2 h-4 w-4" />
                Save to Favorites
              </Button>
              <Button variant="outline" className="w-full bg-transparent" size="lg">
                <Share2 className="mr-2 h-4 w-4" />
                Share Venue
              </Button>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tags</CardTitle>
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

          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{venue.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Open daily 9AM - 6PM</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>Free entry</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
