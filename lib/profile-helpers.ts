import { createClient } from "@/lib/supabase/client"

export interface Profile {
  id: string
  email: string | null
  has_seen_onboarding: boolean
  home_zip?: string | null
  age_focus?: string | null
  radius_miles?: number | null
  favorites?: string[] | null
  created_at?: string
  updated_at?: string
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Operation timed out")), timeoutMs)),
  ])
}

/**
 * Fetch the current user's profile (client-side)
 * Returns null if no profile exists - WILL NOT THROW ERROR
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
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      10000,
    )

    if (error) {
      console.error("[v0] Failed to fetch profile:", error?.message)
      return null
    }

    if (!profile) {
      console.log("[v0] Profile does not exist for user:", user.id)
      return null
    }

    console.log("[v0] Profile found for user:", user.id)
    return profile
  } catch (error: any) {
    console.error("[v0] getProfile error:", error?.message || error)
    return null
  }
}

/**
 * Create a profile for the given user
 * Only call this explicitly when needed
 */
export async function createProfile(userId: string, userEmail: string | null): Promise<Profile | null> {
  try {
    const supabase = createClient()

    console.log("[v0] Creating profile for user:", userId)
    const { data: newProfile, error: insertError } = await withTimeout(
      supabase
        .from("profiles")
        .insert({
          id: userId,
          email: userEmail,
          has_seen_onboarding: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .maybeSingle(),
      10000,
    )

    if (insertError) {
      console.error("[v0] Failed to create profile:", insertError)
      return null
    }

    console.log("[v0] Created new profile successfully")
    return newProfile
  } catch (error: any) {
    console.error("[v0] createProfile error:", error?.message || error)
    return null
  }
}

/**
 * Ensures a profile exists for the given user, creating it if necessary
 * This should be called instead of just fetching the profile
 */
export async function ensureProfile(userId: string, userEmail: string | null): Promise<Profile | null> {
  try {
    const supabase = createClient()

    // Try to fetch existing profile
    const { data: profile, error } = await withTimeout(
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      10000,
    )

    // Profile exists, return it
    if (profile && !error) {
      console.log("[v0] Profile found for user:", userId)
      return profile
    }

    // Profile doesn't exist (PGRST116 = no rows returned), create it
    if (error && error.code === "PGRST116") {
      console.log("[v0] Profile not found, creating new profile for user:", userId)
      return await createProfile(userId, userEmail)
    }

    // Other error occurred
    console.error("[v0] Failed to fetch profile:", error?.message, error?.code)
    return null
  } catch (error: any) {
    console.error("[v0] ensureProfile error (timeout or network):", error?.message || error)
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
  try {
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

    console.log("[v0] Onboarding reset successfully")
    return true
  } catch (error) {
    console.error("[v0] resetOnboarding error:", error)
    return false
  }
}

/**
 * Check if current user has organizer role
 * Checks the users table role field, not profiles
 */
export async function checkOrganizerRole(): Promise<boolean> {
  try {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return false

    const { data } = await supabase.from("users").select("role").eq("id", user.id).single()

    return data?.role === "organizer" || data?.role === "admin"
  } catch (error) {
    console.error("[v0] checkOrganizerRole error:", error)
    return false
  }
}

/**
 * Upgrade user to organizer role via API
 */
export async function upgradeToOrganizer(businessName?: string, contactEmail?: string): Promise<boolean> {
  try {
    console.log("[v0] Calling upgrade API with business details", { businessName, contactEmail })

    const response = await fetch("/api/upgrade-organizer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        business_name: businessName || "",
        contact_email: contactEmail || "",
      }),
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
