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
 */
export async function syncUserRole(userId: string, email: string) {
  const supabase = await createClient()

  const shouldBeAdmin = isAdminEmail(email)
  const role = shouldBeAdmin ? "admin" : "user"

  // Update or insert user record with correct role
  const { error } = await supabase.from("users").upsert(
    {
      id: userId,
      email: email,
      role: role,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "id",
    },
  )

  if (error) {
    console.error("[v0] Failed to sync user role:", error)
  } else {
    console.log(`[v0] Synced user role: ${email} -> ${role}`)
  }
}
