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
  is_organizer: boolean
  created_at?: string
  updated_at?: string
}

/**
 * CLIENT-SIDE: Get current user's profile
 */
export async function getProfile(): Promise<Profile | null> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return profile
}

/**
 * SERVER-SIDE: Get current user's profile
 */
export async function getServerProfile(): Promise<Profile | null> {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

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

  const { data: existing } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (existing) return existing

  const { data: newProfile } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      email: user.email!,
      has_seen_onboarding: false,
      is_organizer: false,
    })
    .select()
    .single()

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
 */
export async function isOrganizer(): Promise<boolean> {
  const profile = await getProfile()
  return profile?.is_organizer ?? false
}

/**
 * Upgrade user to organizer role
 */
export async function upgradeToOrganizer(): Promise<boolean> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  // Update users table role (will trigger sync to profiles.is_organizer)
  const { error: userError } = await supabase.from("users").update({ role: "organizer" }).eq("id", user.id)

  if (userError) {
    console.error("[v0] Failed to update user role:", userError)
    return false
  }

  // Also directly update profile to ensure sync
  const { error: profileError } = await supabase.from("profiles").update({ is_organizer: true }).eq("id", user.id)

  if (profileError) {
    console.error("[v0] Failed to update profile:", profileError)
    return false
  }

  console.log("[v0] User upgraded to organizer")
  return true
}
