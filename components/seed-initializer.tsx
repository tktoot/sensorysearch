"use client"

import { useEffect } from "react"
import { seedBetaData } from "@/lib/seed"

/**
 * Client component to initialize seed data on app load
 * Only runs when SEED_BETA_DATA=true
 */
export function SeedInitializer() {
  useEffect(() => {
    // Run seed on mount
    seedBetaData()
  }, [])

  return null // This component doesn't render anything
}
