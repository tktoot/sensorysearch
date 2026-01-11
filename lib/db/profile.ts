/**
 * Centralized profile database operations
 * Single source of truth for profile management
 */
import { createClient } from "@/lib/supabase/client"
import { createClient as createServerClient } from "@/lib/supabase/server"

export interface Profile {
  id: string
  email: string
  has_seen_onboarding: boolean
  created_at?: string
  updated_at?: string
}

/**
 * CLIENT-SIDE: Get current user's profile
 * SAFE: Will not throw error if profile doesn't exist
 */
export async function getProfile(): Promise<Profile | null> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

  if (error) {
    console.error("[v0] Failed to fetch profile:", error)
    return null
  }

  return profile
}

/**
 * SERVER-SIDE: Get current user's profile
 * SAFE: Will not throw error if profile doesn't exist
 */
export async function getServerProfile(): Promise<Profile | null> {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

  if (error) {
    console.error("[v0] Failed to fetch server profile:", error)
    return null
  }

  return profile
}

/**
 * CLIENT-SIDE: Create or update profile
 */
export async function ensureProfile(): Promise<Profile | null> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: existing } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

  if (existing) return existing

  const { data: newProfile } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      email: user.email!,
      has_seen_onboarding: false,
    })
    .select()
    .maybeSingle()

  return newProfile
}

/**
 * Mark onboarding as completed
 */
export async function markOnboardingComplete(): Promise<boolean> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const { error } = await supabase.from("profiles").update({ has_seen_onboarding: true }).eq("id", user.id)

  return !error
}

/**
 * Reset onboarding flag (for "Replay Intro")
 */
export async function resetOnboarding(): Promise<boolean> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const { error } = await supabase.from("profiles").update({ has_seen_onboarding: false }).eq("id", user.id)

  return !error
}

/**
 * Check if user is an organizer
 * Checks users.role field, NOT profiles table
 */
export async function isOrganizer(): Promise<boolean> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle()

  return data?.role === "organizer" || data?.role === "admin"
}

/**
 * Upgrade user to organizer role - DEPRECATED
 * Use the API route /api/upgrade-organizer instead
 */
export async function upgradeToOrganizer(): Promise<boolean> {
  console.warn("[v0] upgradeToOrganizer is deprecated, use /api/upgrade-organizer API instead")
  return false
}
