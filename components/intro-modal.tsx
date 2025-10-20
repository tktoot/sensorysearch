"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

export function IntroModal() {
  const router = useRouter()
  const pathname = usePathname()
  const [shouldShowIntro, setShouldShowIntro] = useState(false)

  useEffect(() => {
    // Don't show intro if already on intro page
    if (pathname === "/intro") {
      return
    }

    // Check if intro has been completed
    const introCompleted = localStorage.getItem("introCompleted")

    if (!introCompleted) {
      // Show intro on first visit
      setShouldShowIntro(true)
      router.push("/intro")
    }
  }, [pathname, router])

  return null
}
