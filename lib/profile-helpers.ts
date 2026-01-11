import { createClient } from "@/lib/supabase/client"

export interface Profile {
  id: string
  email: string | null
  has_seen_onboarding: boolean
  is_organizer: boolean // Added is_organizer field
  home_zip: string | null
  age_focus: string | null
  radius_miles: number | null
  favorites: string[] | null
  created_at: string
  updated_at: string
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Operation timed out")), timeoutMs)),
  ])
}

/**
 * Fetch the current user's profile (client-side)
 * Creates profile if it doesn't exist
 */
export async function getProfile(): Promise<Profile | null> {
  try {
    const supabase = createClient()

    const {
      data: { user },
    } = await withTimeout(supabase.auth.getUser(), 10000)

    if (!user) {
      console.log("[v0] No user session found")
      return null
    }

    const { data: profile, error } = await withTimeout(
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      10000,
    )

    if (error && error.code === "PGRST116") {
      // Profile doesn't exist, create it
      console.log("[v0] Profile not found, creating new profile for user:", user.id)
      const { data: newProfile, error: insertError } = await withTimeout(
        supabase
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email,
            has_seen_onboarding: false,
            is_organizer: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single(),
        10000,
      )

      if (insertError) {
        console.error("[v0] Failed to create profile:", insertError)
        return null
      }

      console.log("[v0] Created new profile successfully")
      return newProfile
    }

    if (error) {
      console.error("[v0] Failed to fetch profile:", error.message, error.code)
      return null
    }

    console.log("[v0] Profile fetched successfully:", {
      has_seen_onboarding: profile.has_seen_onboarding,
      is_organizer: profile.is_organizer,
    })
    return profile
  } catch (error: any) {
    console.error("[v0] getProfile error (timeout or network):", error?.message || error)
    return null
  }
}

/**
 * Mark onboarding as completed
 */
export async function markOnboardingComplete(): Promise<boolean> {
  try {
    const supabase = createClient()

    const {
      data: { user },
    } = await withTimeout(supabase.auth.getUser(), 5000)
    if (!user) return false

    const { error } = await withTimeout(
      supabase
        .from("profiles")
        .update({
          has_seen_onboarding: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id),
      5000,
    )

    if (error) {
      console.error("[v0] Failed to mark onboarding complete:", error)
      return false
    }

    console.log("[v0] Onboarding marked as complete")
    return true
  } catch (error) {
    console.error("[v0] markOnboardingComplete error:", error)
    return false
  }
}

/**
 * Reset onboarding flag (for testing or "replay intro")
 */
export async function resetOnboarding(): Promise<boolean> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const { error } = await supabase
    .from("profiles")
    .update({
      has_seen_onboarding: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) {
    console.error("[v0] Failed to reset onboarding:", error)
    return false
  }

  return true
}

/**
 * Check if current user is an organizer
 */
export async function isOrganizer(): Promise<boolean> {
  try {
    const profile = await getProfile()
    return profile?.is_organizer ?? false
  } catch (error) {
    console.error("[v0] isOrganizer error:", error)
    return false
  }
}

/**
 * Upgrade user to organizer role
 */
export async function upgradeToOrganizer(): Promise<boolean> {
  try {
    const response = await fetch("/api/upgrade-organizer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("[v0] Failed to upgrade to organizer:", error)
      return false
    }

    const data = await response.json()
    console.log("[v0] User upgraded to organizer successfully", data)
    return true
  } catch (error) {
    console.error("[v0] upgradeToOrganizer error:", error)
    return false
  }
}
