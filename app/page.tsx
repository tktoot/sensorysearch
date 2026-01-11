"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()

    const failsafeTimeout = setTimeout(() => {
      if (isChecking) {
        console.error("[v0] FAILSAFE: Routing check timed out after 15 seconds")
        setError("timeout")
        setIsChecking(false)
      }
    }, 15000)

    return () => clearTimeout(failsafeTimeout)
  }, [])

  const checkAuth = async () => {
    try {
      console.log("[v0] HomePage: Checking auth status")
      const supabase = createClient()

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        console.log("[v0] HomePage: Session found, checking onboarding")

        const { data: profile } = await supabase
          .from("profiles")
          .select("has_seen_onboarding")
          .eq("id", session.user.id)
          .single()

        if (profile?.has_seen_onboarding) {
          console.log("[v0] User has completed onboarding, going to discover")
          router.push("/discover")
        } else {
          console.log("[v0] User needs onboarding")
          router.push("/intro")
        }
      } else {
        console.log("[v0] No session, showing intro")
        router.push("/intro")
      }
    } catch (err) {
      console.error("[v0] HomePage: Error during check:", err)
      router.push("/discover")
    } finally {
      setIsChecking(false)
    }
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <div className="mb-4 text-4xl">⚠️</div>
          <h2 className="mb-2 text-xl font-bold text-foreground">
            {error === "timeout" ? "Taking longer than expected" : "Something went wrong"}
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            We're having trouble loading. You can try again or continue to the app.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button onClick={() => window.location.reload()} variant="default">
              Retry
            </Button>
            <Button onClick={() => router.push("/discover")} variant="outline">
              Go to Discover
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Simple loading state
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
