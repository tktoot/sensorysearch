"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { toast } from "sonner"
import { EmailCaptureModal } from "@/components/email-capture-modal"
import { createBrowserClient } from "@/lib/supabase-browser-client"

interface FavoriteButtonProps {
  listingId: string
  listingName: string
  listingType?: string
  className?: string
}

export function FavoriteButton({ listingId, listingName, listingType = "event", className }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showEmailCapture, setShowEmailCapture] = useState(false)
  const [pendingFavorite, setPendingFavorite] = useState(false)

  useEffect(() => {
    async function checkFavoriteStatus() {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        )
        
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const { data } = await supabase
            .from("favorites")
            .select("id")
            .eq("user_id", user.id)
            .eq("item_id", listingId)
            .single()
          
          setIsFavorited(!!data)
        }
      } catch (error) {
        // User not logged in or error - default to not favorited
      } finally {
        setIsLoading(false)
      }
    }
    
    checkFavoriteStatus()
  }, [listingId])

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const newState = !isFavorited

    if (newState && !isFavorited) {
      const existingEmails = JSON.parse(localStorage.getItem("email_signups") || "[]")
      const hasCapturedEmail = existingEmails.some((signup: any) => signup.source === "favorites")

      if (!hasCapturedEmail) {
        setPendingFavorite(true)
        setShowEmailCapture(true)
        return
      }
    }

    await performToggle(newState)
  }

  const performToggle = async (newState: boolean) => {
    setIsFavorited(newState)
    setIsLoading(true)

    try {
      const response = await fetch("/api/favorites/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ listingId, listingType }),
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

  const handleEmailCaptureSuccess = () => {
    if (pendingFavorite) {
      performToggle(true)
      setPendingFavorite(false)
    }
  }

  const handleEmailCaptureClose = () => {
    setShowEmailCapture(false)
    if (pendingFavorite) {
      // User declined email capture, still allow the favorite
      performToggle(true)
      setPendingFavorite(false)
    }
  }

  return (
    <>
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

      <EmailCaptureModal
        isOpen={showEmailCapture}
        onClose={handleEmailCaptureClose}
        source="favorites"
        title="Get notified about new places"
        description="Sign up to receive alerts when we add new sensory-friendly places near you."
        onSuccess={handleEmailCaptureSuccess}
      />
    </>
  )
}
