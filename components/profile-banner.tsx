"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import Link from "next/link"

export function ProfileBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if profile is complete
    const savedProfile = localStorage.getItem("userProfile")
    const dismissedBanner = localStorage.getItem("profileBannerDismissed")

    if (dismissedBanner === "true") {
      setIsDismissed(true)
      return
    }

    if (savedProfile) {
      const profile = JSON.parse(savedProfile)
      // Profile is incomplete if name, email, or agePreference is missing
      if (!profile.name || !profile.email || !profile.agePreference) {
        setIsVisible(true)
      }
    } else {
      setIsVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
    localStorage.setItem("profileBannerDismissed", "true")
  }

  if (!isVisible || isDismissed) return null

  return (
    <div className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-3 flex-1">
            <p className="text-sm font-medium">Personalize your experience! Create your profile now</p>
            <Button asChild size="sm" variant="secondary" className="shrink-0">
              <Link href="/profile">Get Started</Link>
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-primary-foreground hover:bg-primary-foreground/10"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
