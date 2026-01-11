import type { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (!user || authError) {
      console.error("[v0] UPGRADE_API: Not authenticated", authError)
      return Response.json({ error: "Not authenticated" }, { status: 401 })
    }

    console.log("[v0] UPGRADE_API: User authenticated", user.id, user.email)

    const body = await request.json()
    const businessName = body.businessName?.trim()
    const email = body.email?.trim()

    if (!businessName) {
      return Response.json({ error: "Business name is required" }, { status: 400 })
    }

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Invalid email format" }, { status: 400 })
    }

    console.log("[v0] UPGRADE_API: Input validated", { businessName, email })

    const { error: roleError } = await supabase
      .from("users")
      .update({
        role: "organizer",
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (roleError) {
      console.error("[v0] UPGRADE_API: Failed to update role", roleError)
      return Response.json(
        {
          error: "Failed to update user role",
          details: roleError.message,
          code: roleError.code,
          hint: roleError.hint,
        },
        { status: 500 },
      )
    }

    console.log("[v0] UPGRADE_API: User role updated to organizer")

    const trialEndsAt = new Date()
    trialEndsAt.setMonth(trialEndsAt.getMonth() + 3)

    const { error: profileError } = await supabase.from("organizer_profiles").upsert(
      {
        user_id: user.id,
        business_name: businessName,
        email: email,
        trial_started_at: new Date().toISOString(),
        trial_ends_at: trialEndsAt.toISOString(),
        is_trial_active: true,
        subscription_status: "trial",
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      },
    )

    if (profileError) {
      console.error("[v0] UPGRADE_API: Failed to create organizer profile", profileError)
      return Response.json(
        {
          error: "Failed to create organizer profile",
          details: profileError.message,
          code: profileError.code,
          hint: profileError.hint,
        },
        { status: 500 },
      )
    }

    console.log("[v0] UPGRADE_API: SUCCESS - Organizer profile created/updated")

    return Response.json(
      {
        ok: true,
        message: "Successfully upgraded to organizer",
        trialEndsAt: trialEndsAt.toISOString(),
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("[v0] UPGRADE_API: Unexpected error", error)
    return Response.json(
      {
        error: "Internal server error",
        details: error?.message || String(error),
      },
      { status: 500 },
    )
  }
}
