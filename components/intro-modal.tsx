"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getProfile } from "@/lib/profile-helpers"
import { createClient } from "@/lib/supabase/client"

export function IntroModal() {
  const router = useRouter()
  const pathname = usePathname()
  const [isClient, setIsClient] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    // Don't show intro if already on intro page
    if (pathname === "/intro") {
      setIsChecking(false)
      return
    }

    // Check onboarding status from Supabase
    checkOnboardingStatus()
  }, [pathname, router, isClient])

  const checkOnboardingStatus = async () => {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) {
      const profile = await getProfile()

      // Only redirect if profile exists AND hasn't seen onboarding
      if (profile && !profile.has_seen_onboarding) {
        console.log("[v0] User needs onboarding, redirecting to /intro")
        router.push("/intro")
      } else if (!profile) {
        console.log("[v0] No profile found, but not blocking navigation")
      }
    }

    setIsChecking(false)
  }

  return null
}
