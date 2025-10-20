"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { isGuestFavorite } from "@/lib/guest-store"
import { toast } from "sonner"

interface FavoriteButtonProps {
  listingId: string
  listingName: string
  className?: string
}

export function FavoriteButton({ listingId, listingName, className }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsFavorited(isGuestFavorite(listingId))
  }, [listingId])

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const newState = !isFavorited
    setIsFavorited(newState)
    setIsLoading(true)

    try {
      const response = await fetch("/api/favorites/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      })

      if (!response.ok) {
        throw new Error("Failed to toggle favorite")
      }

      const data = await response.json()

      setIsFavorited(data.isFavorite)

      window.dispatchEvent(new Event("favoriteToggled"))

      toast.success(data.isFavorite ? `Added ${listingName} to favorites` : `Removed ${listingName} from favorites`)
    } catch (error) {
      console.error("[v0] Failed to toggle favorite:", error)
      setIsFavorited(!newState)
      toast.error("Failed to update favorites. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`h-8 w-8 ${className}`}
      onClick={handleToggle}
      disabled={isLoading}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart className={`h-4 w-4 transition-colors ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
    </Button>
  )
}
