"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, ChevronDown, ChevronUp } from "lucide-react"
import type { LocationData } from "@/lib/location-utils"

interface LocationMapProps {
  userLocation: LocationData
  radius: number // in miles
  markers?: Array<{
    id: string
    name: string
    coordinates: { lat: number; lng: number }
    type: "event" | "venue"
  }>
  className?: string
  defaultExpanded?: boolean
}

export function LocationMap({
  userLocation,
  radius,
  markers = [],
  className,
  defaultExpanded = false,
}: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    if (!isExpanded || !mapRef.current) return

    // Load Leaflet dynamically
    const loadMap = async () => {
      try {
        // @ts-ignore - Leaflet will be loaded dynamically
        const L = (await import("leaflet")).default

        // Clear existing map
        mapRef.current!.innerHTML = ""

        // Create map
        const map = L.map(mapRef.current!, {
          center: [userLocation.lat, userLocation.lng],
          zoom: getZoomLevel(radius),
          scrollWheelZoom: false,
        })

        // Add tile layer (OpenStreetMap)
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          className: "map-tiles",
        }).addTo(map)

        // Add user location marker
        const userIcon = L.divIcon({
          className: "custom-marker",
          html: `<div style="background: hsl(var(--primary)); width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        })

        L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
          .addTo(map)
          .bindPopup(`<strong>Your Location</strong><br/>${userLocation.city || "Current Location"}`)

        // Add radius circle
        const radiusMeters = radius * 1609.34 // Convert miles to meters
        L.circle([userLocation.lat, userLocation.lng], {
          radius: radiusMeters,
          color: "hsl(var(--primary))",
          fillColor: "hsl(var(--primary))",
          fillOpacity: 0.1,
          weight: 2,
        }).addTo(map)

        // Add event/venue markers
        markers
          .filter((marker) => marker.coordinates && marker.coordinates.lat && marker.coordinates.lng)
          .forEach((marker) => {
            const markerIcon = L.divIcon({
              className: "custom-marker",
              html: `<div style="background: ${marker.type === "event" ? "hsl(var(--accent))" : "hsl(var(--success))"}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })

            L.marker([marker.coordinates.lat, marker.coordinates.lng], { icon: markerIcon })
              .addTo(map)
              .bindPopup(`<strong>${marker.name}</strong><br/>${marker.type === "event" ? "Event" : "Venue"}`)
          })

        setMapLoaded(true)
        console.log("[v0] MAP_LOADED", { markers: markers.length, radius })
      } catch (error) {
        console.error("[v0] MAP_LOAD_ERROR", error)
      }
    }

    loadMap()
  }, [isExpanded, userLocation, radius, markers])

  const getZoomLevel = (radiusMiles: number): number => {
    if (radiusMiles <= 5) return 12
    if (radiusMiles <= 10) return 11
    if (radiusMiles <= 25) return 10
    if (radiusMiles <= 50) return 9
    return 8
  }

  return (
    <Card className={className}>
      <div className="p-4">
        <Button variant="ghost" className="w-full justify-between" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="font-medium">{isExpanded ? "Hide Map" : "Show Map"}</span>
          </div>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        {isExpanded && (
          <div className="mt-4">
            <div
              ref={mapRef}
              className="h-[400px] w-full rounded-lg overflow-hidden border-2 border-border"
              style={{
                background: "hsl(var(--muted))",
              }}
            />
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                <p className="text-sm text-muted-foreground">Loading map...</p>
              </div>
            )}
            <p className="mt-2 text-xs text-muted-foreground text-center">
              Showing {markers.length} {markers.length === 1 ? "location" : "locations"} within {radius} miles
            </p>
          </div>
        )}
      </div>

      {/* Add Leaflet CSS */}
      {isExpanded && (
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      )}
    </Card>
  )
}
