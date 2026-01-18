import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Volume2, Sun, Users, Heart, Share2, Clock, Accessibility } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

// Dynamic pages will be generated on-demand when users visit them

export default async function VenuePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: venue } = await supabase.from("venues").select("*").eq("id", params.id).single()

  if (!venue) {
    notFound()
  }

  const getSensoryLevel = (level: string | null) => {
    if (!level) return "text-foreground"

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

  const mainImage = venue.images && venue.images.length > 0 ? venue.images[0] : null

  const sensoryFeatures = Array.isArray(venue.sensory_features) ? venue.sensory_features : []

  const hasWheelchairAccess =
    sensoryFeatures.includes("wheelchair_accessible") || sensoryFeatures.includes("wheelchair-accessible")
  const hasSensoryHours =
    sensoryFeatures.includes("sensory_friendly_hours") || sensoryFeatures.includes("sensory-friendly-hours")
  const hasQuietSpace = sensoryFeatures.includes("quiet_space") || sensoryFeatures.includes("quiet-space")

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Image */}
      <div className="relative mb-8 aspect-[21/9] overflow-hidden rounded-xl">
        <img
          src={mainImage || "/placeholder.svg?height=400&width=1200"}
          alt={venue.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          {venue.category && <Badge className="mb-3">{venue.category}</Badge>}
          <h1 className="mb-2 text-4xl font-bold text-card text-balance">{venue.name}</h1>
          <div className="flex items-center gap-4 text-card">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">
                {venue.address && `${venue.address}, `}
                {venue.city}
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
              <p className="text-muted-foreground leading-relaxed">
                {venue.description || "No description available."}
              </p>
            </CardContent>
          </Card>

          {/* Sensory Information */}
          <Card>
            <CardHeader>
              <CardTitle>Sensory Information</CardTitle>
              <CardDescription>Detailed sensory attributes to help you prepare for your visit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {venue.noise_level && (
                <>
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
                    <Badge variant="outline" className={`${getSensoryLevel(venue.noise_level)} capitalize`}>
                      {venue.noise_level}
                    </Badge>
                  </div>
                  <Separator />
                </>
              )}

              {venue.lighting && (
                <>
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
                    <Badge variant="outline" className={`${getSensoryLevel(venue.lighting)} capitalize`}>
                      {venue.lighting}
                    </Badge>
                  </div>
                  <Separator />
                </>
              )}

              {venue.crowd_level && (
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
                  <Badge variant="outline" className={`${getSensoryLevel(venue.crowd_level)} capitalize`}>
                    {venue.crowd_level}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Accessibility Features */}
          {(hasWheelchairAccess || hasSensoryHours || hasQuietSpace || venue.accessibility_notes) && (
            <Card>
              <CardHeader>
                <CardTitle>Accessibility Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {hasWheelchairAccess && (
                  <div className="flex items-center gap-3">
                    <Accessibility className="h-5 w-5 text-primary" />
                    <span>Wheelchair Accessible</span>
                  </div>
                )}
                {hasSensoryHours && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>Sensory-Friendly Hours Available</span>
                  </div>
                )}
                {hasQuietSpace && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>Quiet Space Available</span>
                  </div>
                )}
                {venue.accessibility_notes && (
                  <div className="mt-4 text-sm text-muted-foreground">
                    <p className="font-medium mb-1">Additional Notes:</p>
                    <p>{venue.accessibility_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
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
          {sensoryFeatures.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {sensoryFeatures.map((feature) => (
                    <Badge key={feature} variant="secondary">
                      {feature.replace(/_/g, " ").replace(/-/g, " ")}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {venue.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{venue.address}</span>
                </div>
              )}
              {venue.hours && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{venue.hours}</span>
                </div>
              )}
              {venue.phone && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">📞</span>
                  <span>{venue.phone}</span>
                </div>
              )}
              {venue.website && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">🌐</span>
                  <a
                    href={venue.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Visit Website
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
