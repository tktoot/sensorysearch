"use client"

import { useEffect } from "react"
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/discover")
  }, []) // Empty dependency array ensures this only runs once on mount

  // Show nothing while redirecting
  return null
}
