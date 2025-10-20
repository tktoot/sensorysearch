"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { MapPin, Loader2, Navigation, X, ChevronDown, ChevronUp } from "lucide-react"
import {
  getCurrentLocation,
  geocodeLocation,
  saveLocationPreferences,
  loadLocationPreferences,
  type LocationData,
  type LocationPreferences,
} from "@/lib/location-utils"
import { toast } from "sonner"
import Image from "next/image"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface LocationSelectorProps {
  onLocationChange: (preferences: LocationPreferences) => void
  className?: string
}

export function LocationSelector({ onLocationChange, className }: LocationSelectorProps) {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [radius, setRadius] = useState(25)
  const [isDetecting, setIsDetecting] = useState(false)
  const [manualInput, setManualInput] = useState("")
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    // Load saved preferences on mount
    const saved = loadLocationPreferences()
    if (saved) {
      setLocation(saved.location)
      setRadius(saved.radius)
      if (saved.location) {
        onLocationChange(saved)
        setIsCollapsed(true)
      }
    }
  }, [])

  const handleDetectLocation = async () => {
    setIsDetecting(true)
    console.log("[v0] LOCATION_DETECT_START - Detecting user location")

    try {
      const detectedLocation = await getCurrentLocation()
      setLocation(detectedLocation)

      const preferences: LocationPreferences = {
        location: detectedLocation,
        radius,
        useCurrentLocation: true,
      }

      saveLocationPreferences(preferences)
      onLocationChange(preferences)

      toast.success(`Location detected: ${detectedLocation.city || "Unknown"}`)
      console.log("[v0] LOCATION_DETECT_OK", detectedLocation)
      setIsCollapsed(true)
    } catch (error) {
      console.error("[v0] LOCATION_DETECT_ERROR", error)
      toast.error("Failed to detect location. Please enter manually.")
    } finally {
      setIsDetecting(false)
    }
  }

  const handleManualLocation = async () => {
    if (!manualInput.trim()) {
      toast.error("Please enter a city or ZIP code")
      return
    }

    setIsGeocoding(true)
    console.log("[v0] LOCATION_GEOCODE_START", { query: manualInput })

    try {
      const geocodedLocation = await geocodeLocation(manualInput)

      if (!geocodedLocation) {
        toast.error("Location not found. Please try a different search.")
        return
      }

      setLocation(geocodedLocation)

      const preferences: LocationPreferences = {
        location: geocodedLocation,
        radius,
        useCurrentLocation: false,
      }

      saveLocationPreferences(preferences)
      onLocationChange(preferences)

      toast.success(`Location set: ${geocodedLocation.city || manualInput}`)
      console.log("[v0] LOCATION_GEOCODE_OK", geocodedLocation)
      setIsCollapsed(true)
    } catch (error) {
      console.error("[v0] LOCATION_GEOCODE_ERROR", error)
      toast.error("Failed to find location. Please try again.")
    } finally {
      setIsGeocoding(false)
    }
  }

  const handleRadiusChange = (value: number[]) => {
    const newRadius = value[0]
    setRadius(newRadius)

    if (location) {
      const preferences: LocationPreferences = {
        location,
        radius: newRadius,
        useCurrentLocation: false,
      }

      saveLocationPreferences(preferences)
      onLocationChange(preferences)
      console.log("[v0] RADIUS_CHANGED", { radius: newRadius })
    }
  }

  const handleClearLocation = () => {
    setLocation(null)
    setManualInput("")
    setIsCollapsed(false)
    localStorage.removeItem("locationPreferences")
    onLocationChange({
      location: null,
      radius: 25,
      useCurrentLocation: false,
    })
    toast.success("Location filter cleared")
    console.log("[v0] LOCATION_CLEARED")
  }

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed)
    console.log("[v0] LOCATION_PANEL_TOGGLED", { collapsed: !isCollapsed })
  }

  if (isCollapsed && location) {
    return (
      <TooltipProvider>
        <div className={`flex items-center justify-center gap-3 ${className}`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={toggleCollapsed}
                variant="outline"
                size="sm"
                className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-50 to-purple-50 px-4 py-2 shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
                aria-label="Adjust search radius"
                aria-expanded={false}
              >
                <div className="relative h-6 w-6 flex-shrink-0">
                  <Image
                    src="/branding/sensory-search-icon.png"
                    alt="Sensory Search logo"
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {radius} mi • {location.zipCode || location.city}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-y-0.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Adjust search area</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    )
  }

  return (
    <Card className={`${className} animate-in slide-in-from-top-4 fade-in duration-300`}>
      <CardContent className="space-y-4 p-4">
        {location && (
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Search Location</h3>
            <Button
              onClick={toggleCollapsed}
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-xs"
              aria-label="Minimize search radius panel"
              aria-expanded={true}
            >
              <ChevronUp className="h-3 w-3" />
              Minimize
            </Button>
          </div>
        )}

        {/* Current Location Display */}
        {location && (
          <div className="flex items-center justify-between rounded-lg bg-primary/10 p-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">{location.city || "Custom Location"}</p>
                <p className="text-xs text-muted-foreground">Within {radius} miles</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClearLocation} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Location Detection */}
        {!location && (
          <>
            <div className="space-y-2">
              <Label>Detect Location</Label>
              <Button
                onClick={handleDetectLocation}
                disabled={isDetecting}
                className="w-full bg-transparent"
                variant="outline"
              >
                {isDetecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Detecting...
                  </>
                ) : (
                  <>
                    <Navigation className="mr-2 h-4 w-4" />
                    Use My Current Location
                  </>
                )}
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            {/* Manual Location Input */}
            <div className="space-y-2">
              <Label htmlFor="manual-location">Enter City or ZIP Code</Label>
              <div className="flex gap-2">
                <Input
                  id="manual-location"
                  placeholder="e.g., Green Lane, PA or 18054"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleManualLocation()
                    }
                  }}
                />
                <Button onClick={handleManualLocation} disabled={isGeocoding || !manualInput.trim()}>
                  {isGeocoding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Set"}
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Radius Slider */}
        {location && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Search Radius</Label>
              <Badge variant="secondary">{radius} miles</Badge>
            </div>
            <Slider value={[radius]} onValueChange={handleRadiusChange} min={5} max={100} step={5} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5 mi</span>
              <span>100 mi</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
