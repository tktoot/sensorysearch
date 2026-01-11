"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

type SubmissionType = "venue" | "event" | "park" | "worship" | null

// Renamed to venueListingType to be more descriptive
type VenueListingType = "business" | "community" | null

export default function AdvertisePage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/submit")
  }, [router])

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <p className="text-muted-foreground">Redirecting to submission page...</p>
    </div>
  )
}
