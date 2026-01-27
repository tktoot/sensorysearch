import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ADMIN_EMAILS } from "@/lib/config"

export type UserRole = "user" | "organizer" | "business" | "admin"

export interface ServerAuthUser {
  id: string
  email: string
  role: UserRole
}

/**
 * Get the current authenticated user from Supabase session
 * This should only be called from server components or API routes
 */
export async function getServerUser(): Promise<ServerAuthUser | null> {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  // Check if user exists in our users table
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("role, email")
    .eq("id", user.id)
    .single()

  if (userError || !userData) {
    // User doesn't exist in users table yet, return default role
    return {
      id: user.id,
      email: user.email || "",
      role: "user",
    }
  }

  return {
    id: user.id,
    email: userData.email || user.email || "",
    role: (userData.role as UserRole) || "user",
  }
}

/**
 * Check if the current user has admin role
 * Redirects to home page if not admin
 */
export async function requireAdmin() {
  const user = await getServerUser()

  if (!user || user.role !== "admin") {
    redirect("/")
  }

  return user
}

/**
 * Check if the current user has organizer or admin role
 * Redirects to upgrade page if not authorized
 */
export async function requireOrganizer() {
  const user = await getServerUser()

  if (!user || (user.role !== "organizer" && user.role !== "admin")) {
    redirect("/upgrade-organizer")
  }

  return user
}

/**
 * Check if an email should have admin role
 */
export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

/**
 * Sync user role based on email (call after sign-in)
 * 
 * IMPORTANT: This function must NEVER overwrite an existing role (especially organizer)
 * back to 'user'. Role should only be set to 'user' on initial profile creation.
 * Admin emails are the exception - they should always be promoted to admin.
 */
export async function syncUserRole(userId: string, email: string) {
  const supabase = await createClient()

  // First, check if user already exists and get their current role
  const { data: existingUser, error: fetchError } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single()

  if (fetchError && fetchError.code !== "PGRST116") {
    // PGRST116 = no rows found, which is expected for new users
    console.error("[v0] Failed to fetch existing user:", fetchError)
    return
  }

  const shouldBeAdmin = isAdminEmail(email)

  if (existingUser) {
    // User exists - only update role if they should be admin and aren't already
    if (shouldBeAdmin && existingUser.role !== "admin") {
      const { error } = await supabase
        .from("users")
        .update({
          role: "admin",
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (error) {
        console.error("[v0] Failed to promote user to admin:", error)
      } else {
        console.log(`[v0] Promoted user to admin: ${email}`)
      }
    }
    // Otherwise, preserve their existing role (user, organizer, business, etc.)
    return
  }

  // User doesn't exist - create with appropriate initial role
  const initialRole = shouldBeAdmin ? "admin" : "user"

  const { error } = await supabase.from("users").insert({
    id: userId,
    email: email,
    role: initialRole,
  })

  if (error) {
    console.error("[v0] Failed to create user:", error)
  } else {
    console.log(`[v0] Created new user: ${email} -> ${initialRole}`)
  }
}
