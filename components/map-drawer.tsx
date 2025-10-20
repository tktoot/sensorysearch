"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { MapPin, Minimize2 } from "lucide-react"
import type { LocationData } from "@/lib/location-utils"
import Image from "next/image"

interface MapDrawerProps {
  userLocation: LocationData
  radius: number
  markers?: Array<{
    id: string
    name: string
    coordinates: { lat: number; lng: number }
    type: "event" | "venue" | "community"
  }>
  inUtilitiesBar?: boolean
}

export function MapDrawer({ userLocation, radius, markers = [], inUtilitiesBar = false }: MapDrawerProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<Map<string, any>>(new Map())

  // Load expanded state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("discover_map_expanded")
    if (saved === "true") {
      setIsExpanded(true)
    }
  }, [])

  // Save expanded state to localStorage
  useEffect(() => {
    localStorage.setItem("discover_map_expanded", isExpanded.toString())
  }, [isExpanded])

  const toggleDrawer = useCallback(() => {
    setIsExpanded((prev) => !prev)
  }, [])

  const recenterMap = useCallback(() => {
    if (mapInstanceRef.current && userLocation) {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], getZoomLevel(radius))
    }
  }, [userLocation, radius])

  const getZoomLevel = (radiusMiles: number): number => {
    if (radiusMiles <= 5) return 12
    if (radiusMiles <= 10) return 11
    if (radiusMiles <= 25) return 10
    if (radiusMiles <= 50) return 9
    return 8
  }

  const createCustomMarker = (marker: any, L: any, isSelected = false) => {
    const iconUrl = "/icons/puzzle-pin.png"

    const iconSize = 48
    const icon = L.icon({
      iconUrl,
      iconSize: [iconSize, iconSize],
      iconAnchor: [iconSize / 2, iconSize], // Bottom-center anchor
      popupAnchor: [0, -iconSize],
      className: isSelected ? "custom-pin-marker marker-selected" : "custom-pin-marker",
    })

    return icon
  }

  useEffect(() => {
    if (!isExpanded || isInitialized || !mapRef.current) return

    const loadMap = async () => {
      try {
        // @ts-ignore - Leaflet will be loaded dynamically
        const L = (await import("leaflet")).default

        // Create map with iPhone-optimized settings
        const map = L.map(mapRef.current!, {
          center: [userLocation.lat, userLocation.lng],
          zoom: getZoomLevel(radius),
          scrollWheelZoom: true,
          zoomControl: true,
          tap: true,
          tapTolerance: 20,
        })

        mapInstanceRef.current = map

        // Add tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          className: "map-tiles",
        }).addTo(map)

        // Add user location marker
        const userIcon = L.divIcon({
          className: "user-location-marker",
          html: `<div style="background: hsl(var(--primary)); width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        })

        L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
          .addTo(map)
          .bindPopup(`<strong>Your Location</strong><br/>${userLocation.city || "Current Location"}`)

        // Add radius circle
        const radiusMeters = radius * 1609.34
        L.circle([userLocation.lat, userLocation.lng], {
          radius: radiusMeters,
          color: "hsl(var(--primary))",
          fillColor: "hsl(var(--primary))",
          fillOpacity: 0.1,
          weight: 2,
        }).addTo(map)

        markers
          .filter((marker) => marker.coordinates?.lat && marker.coordinates?.lng)
          .forEach((marker) => {
            const icon = createCustomMarker(marker, L, false)

            const ariaLabel = `Location: ${marker.name}`

            const markerInstance = L.marker([marker.coordinates.lat, marker.coordinates.lng], {
              icon,
              title: ariaLabel,
              alt: ariaLabel,
              keyboard: true,
              riseOnHover: true,
            })
              .addTo(map)
              .bindPopup(
                `<div style="min-width: 150px;"><strong>${marker.name}</strong><br/><span style="text-transform: capitalize;">${marker.type}</span><br/><a href="/${marker.type}/${marker.id}" style="color: hsl(var(--primary)); text-decoration: underline;">View details</a></div>`,
              )

            // Handle marker selection
            markerInstance.on("click", () => {
              setSelectedMarkerId(marker.id)
              // Update icon to selected state
              markerInstance.setIcon(createCustomMarker(marker, L, true))
            })

            markerInstance.on("popupclose", () => {
              if (selectedMarkerId === marker.id) {
                setSelectedMarkerId(null)
                markerInstance.setIcon(createCustomMarker(marker, L, false))
              }
            })

            markersRef.current.set(marker.id, markerInstance)
          })

        // iPhone fix: Invalidate size on resize and orientation change
        const handleResize = () => {
          if (mapInstanceRef.current) {
            setTimeout(() => {
              mapInstanceRef.current.invalidateSize()
            }, 100)
          }
        }

        window.addEventListener("resize", handleResize)
        window.addEventListener("orientationchange", handleResize)

        setMapLoaded(true)
        setIsInitialized(true)

        return () => {
          window.removeEventListener("resize", handleResize)
          window.removeEventListener("orientationchange", handleResize)
        }
      } catch (error) {
        console.error("Failed to load map", error)
      }
    }

    loadMap()
  }, [isExpanded, isInitialized, userLocation, radius, markers, selectedMarkerId])

  useEffect(() => {
    if (isExpanded && mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current.invalidateSize()
      }, 300)
    }
  }, [isExpanded])

  const MapTogglePill = () => (
    <Button
      onClick={toggleDrawer}
      variant={isExpanded ? "default" : "outline"}
      size="sm"
      className={`group flex items-center gap-2 rounded-full px-4 py-2 shadow-md transition-all duration-150 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 ${
        isExpanded
          ? "bg-gradient-to-r from-teal-500 to-purple-500 text-white"
          : "bg-gradient-to-r from-teal-50 to-purple-50"
      }`}
      aria-pressed={isExpanded}
      aria-controls="discover-map-drawer"
      aria-label={isExpanded ? "Hide map" : "Show map"}
    >
      <div className="relative h-5 w-5 flex-shrink-0">
        <Image src="/branding/sensory-search-icon.png" alt="" width={20} height={20} className="object-contain" />
      </div>
      <span className="text-sm font-heading font-semibold tracking-wide">{isExpanded ? "Map (On)" : "Map"}</span>
    </Button>
  )

  return (
    <>
      {/* Render pill inline if in utilities bar, otherwise floating */}
      {inUtilitiesBar ? (
        <MapTogglePill />
      ) : (
        <div className="fixed top-20 right-4 z-40 md:top-24">
          <MapTogglePill />
        </div>
      )}

      {/* Map Drawer */}
      {isExpanded && (
        <div
          id="discover-map-drawer"
          role="region"
          aria-label="Map view"
          className="map-container mb-6 overflow-hidden rounded-xl border border-primary/20 bg-background shadow-lg transition-all duration-200 ease-out"
          style={{
            height: "40dvh",
            minHeight: "300px",
            maxHeight: "500px",
          }}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-heading font-semibold">Map View</h3>
              {/* Legend */}
              <div className="hidden items-center gap-3 text-xs text-muted-foreground md:flex">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-accent" />
                  Events
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Venues
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full" style={{ background: "hsl(142, 76%, 36%)" }} />
                  Community
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={recenterMap} variant="ghost" size="sm" className="h-8 text-xs" aria-label="Recenter map">
                <MapPin className="mr-1 h-3 w-3" />
                Recenter
              </Button>
              <Button onClick={toggleDrawer} variant="ghost" size="sm" className="h-8 text-xs" aria-label="Hide map">
                <Minimize2 className="mr-1 h-3 w-3" />
                Hide Map
              </Button>
            </div>
          </div>

          {/* Map Container */}
          <div className="relative h-[calc(100%-52px)]">
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                <div className="h-full w-full animate-pulse rounded-lg bg-muted" />
              </div>
            )}
            <div ref={mapRef} className="h-full w-full" />
          </div>

          {/* Mobile Legend */}
          <div className="flex items-center justify-center gap-4 border-t border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground md:hidden">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-accent" />
              Events
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Venues
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ background: "hsl(142, 76%, 36%)" }} />
              Community
            </span>
          </div>
        </div>
      )}

      {isExpanded && (
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      )}

      <style jsx global>{`
        /* iPhone map rendering fixes */
        .map-container {
          position: relative;
          touch-action: pan-x pan-y;
          -webkit-tap-highlight-color: transparent;
          -webkit-overflow-scrolling: touch;
          overflow: hidden;
        }

        /* Custom marker pulse animation */
        @keyframes marker-pulse {
          0% {
            transform: scale(0.96);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.02);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .custom-pin-marker {
          animation: marker-pulse 1s ease-out;
          transition: all 0.2s ease;
        }

        .custom-pin-marker:hover {
          transform: scale(1.1);
          z-index: 1000 !important;
        }

        /* Selected marker - only add glow, no color changes */
        .marker-selected {
          filter: drop-shadow(0 0 12px rgba(76, 166, 168, 0.6));
          z-index: 1000 !important;
        }

        /* Respect prefers-reduced-motion */
        @media (prefers-reduced-motion: reduce) {
          .custom-pin-marker {
            animation: none;
          }
        }

        /* Responsive heights for iPhone using 100dvh */
        @media (max-width: 640px) {
          #discover-map-drawer {
            height: 35dvh !important;
            min-height: 250px !important;
          }
        }
        @media (max-width: 360px) {
          #discover-map-drawer {
            height: 30dvh !important;
            min-height: 200px !important;
          }
        }

        /* Ensure markers are interactive with 44x44 tap targets */
        .leaflet-marker-icon {
          cursor: pointer;
          min-width: 44px !important;
          min-height: 44px !important;
        }

        /* User location marker */
        .user-location-marker {
          z-index: 999 !important;
        }
      `}</style>
    </>
  )
}
