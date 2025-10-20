"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import DiscoverPage from "@/app/discover/page"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Attempt client-side redirect to /discover
    try {
      router.push("/discover")
    } catch (error) {
      console.error("[v0] Failed to redirect to /discover:", error)
      // Fallback: render discover content directly if redirect fails
    }
  }, [router])

  // Fallback: render the same content as /discover if redirect fails
  return <DiscoverPage />
}
