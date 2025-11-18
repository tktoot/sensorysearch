"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

export function IntroModal() {
  const router = useRouter()
  const pathname = usePathname()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    // Don't show intro if already on intro page
    if (pathname === "/intro") {
      return
    }

    // Check if intro has been completed
    const introCompleted = localStorage.getItem("introCompleted")

    if (!introCompleted) {
      // Show intro on first visit
      router.push("/intro")
    }
  }, [pathname, router, isClient])

  return null
}
