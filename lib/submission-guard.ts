// Centralized submission guard to prevent routing loops
import { createClient } from "@/lib/supabase/client"

export interface SubmissionGuardResult {
  allowed: boolean
  redirect?: string
  reason?: string
}

/**
 * Check if user can submit listings
 * Returns redirect path if user needs to take action
 */
export async function checkSubmissionAccess(targetPath = "/submit"): Promise<SubmissionGuardResult> {
  const supabase = createClient()

  console.log("[v0] GUARD: Checking submission access for:", targetPath)

  // Check authentication
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    console.log("[v0] GUARD: Not authenticated, redirect to intro with next param")
    return {
      allowed: false,
      redirect: `/intro?next=${encodeURIComponent(targetPath)}`,
      reason: "not_authenticated",
    }
  }

  console.log("[v0] GUARD: Session found for user:", session.user.id)

  const { data: userData, error } = await supabase.from("users").select("role").eq("id", session.user.id).single()

  if (error) {
    console.error("[v0] GUARD: Failed to fetch user role:", error)
    return {
      allowed: false,
      redirect: `/upgrade-organizer?next=${encodeURIComponent(targetPath)}`,
      reason: "user_fetch_error",
    }
  }

  console.log("[v0] GUARD: User role:", userData?.role)

  if (userData?.role !== "organizer" && userData?.role !== "admin") {
    console.log("[v0] GUARD: Not an organizer, redirect to upgrade")
    return {
      allowed: false,
      redirect: `/upgrade-organizer?next=${encodeURIComponent(targetPath)}`,
      reason: "not_organizer",
    }
  }

  console.log("[v0] GUARD: Access granted to", targetPath)
  return {
    allowed: true,
  }
}
