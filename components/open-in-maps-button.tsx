"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MapPin, ExternalLink } from "lucide-react"

interface OpenInMapsButtonProps {
  address: string
  className?: string
}

export function OpenInMapsButton({ address, className }: OpenInMapsButtonProps) {
  const [platform, setPlatform] = useState<"ios" | "android" | "unknown">("unknown")

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase()
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform("ios")
    } else if (/android/.test(userAgent)) {
      setPlatform("android")
    }
  }, [])

  const encodedAddress = encodeURIComponent(address)
  const appleMapsUrl = `http://maps.apple.com/?daddr=${encodedAddress}`
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`

  const handleOpenMaps = (url: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    window.open(url, "_blank", "noopener,noreferrer")
  }

  if (platform === "ios") {
    return (
      <Button variant="outline" size="sm" className={`gap-2 ${className}`} onClick={handleOpenMaps(appleMapsUrl)}>
        <MapPin className="h-4 w-4" />
        Open in Apple Maps
        <ExternalLink className="h-3 w-3" />
      </Button>
    )
  }

  if (platform === "android") {
    return (
      <Button variant="outline" size="sm" className={`gap-2 ${className}`} onClick={handleOpenMaps(googleMapsUrl)}>
        <MapPin className="h-4 w-4" />
        Open in Google Maps
        <ExternalLink className="h-3 w-3" />
      </Button>
    )
  }

  // Unknown platform - show both options
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={handleOpenMaps(appleMapsUrl)}>
        <MapPin className="h-4 w-4" />
        Apple Maps
        <ExternalLink className="h-3 w-3" />
      </Button>
      <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={handleOpenMaps(googleMapsUrl)}>
        <MapPin className="h-4 w-4" />
        Google Maps
        <ExternalLink className="h-3 w-3" />
      </Button>
    </div>
  )
}
