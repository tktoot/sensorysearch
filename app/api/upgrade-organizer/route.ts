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
      console.error("[v0] UPGRADE_ERROR: No authenticated user", authError)
      return Response.json({ error: "Not authenticated. Please sign in." }, { status: 401 })
    }

    console.log("[v0] UPGRADE_START: User", user.id, user.email)

    const body = await request.json()
    const businessName = body.businessName?.trim()
    const email = body.email?.trim()

    if (!businessName || !email) {
      console.error("[v0] UPGRADE_ERROR: Missing required fields")
      return Response.json({ error: "Business name and email are required" }, { status: 400 })
    }

    console.log("[v0] UPGRADE_DETAILS:", { businessName, email })

    const { error: roleError } = await supabase
      .from("users")
      .update({
        role: "organizer",
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (roleError) {
      console.error("[v0] UPGRADE_ERROR: Failed to update user role", roleError)
      return Response.json(
        {
          error: "Failed to update user role",
          supabase: {
            code: roleError.code,
            message: roleError.message,
            details: roleError.details,
            hint: roleError.hint,
          },
        },
        { status: 500 },
      )
    }

    console.log("[v0] ROLE_UPDATE: User role set to organizer")

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
        onConflict: "user_id", // Upsert on conflict with user_id
      },
    )

    if (profileError) {
      console.error("[v0] UPGRADE_ERROR: Failed to upsert organizer_profiles", profileError)
      return Response.json(
        {
          error: "Organizer upgrade failed",
          supabase: {
            code: profileError.code,
            message: profileError.message,
            details: profileError.details,
            hint: profileError.hint,
          },
        },
        { status: 500 },
      )
    }

    console.log("[v0] UPGRADE_SUCCESS:", {
      userId: user.id,
      email: user.email,
      businessName,
      trialEndsAt: trialEndsAt.toISOString(),
    })

    return Response.json(
      {
        ok: true,
        message: "Successfully upgraded to organizer",
        trialEndsAt: trialEndsAt.toISOString(),
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("[v0] UPGRADE_ERROR: Unexpected exception", error)
    return Response.json(
      {
        error: "Internal server error",
        details: error?.message || String(error),
      },
      { status: 500 },
    )
  }
}
