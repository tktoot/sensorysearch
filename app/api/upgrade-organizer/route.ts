import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { BETA_ENABLED } from "@/lib/config"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.error("[v0] No user session found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body for business details
    const body = await request.json()
    const businessName = body.business_name || ""
    const contactEmail = body.contact_email || user.email || ""

    console.log("[v0] Upgrading user to organizer", {
      userId: user.id,
      businessName,
      contactEmail,
    })

    // During beta, upgrade is free - just update role
    if (BETA_ENABLED) {
      const { error: roleError } = await supabase
        .from("users")
        .update({
          role: "organizer",
          business_name: businessName || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (roleError) {
        console.error("[v0] Failed to update user role:", roleError)
        return NextResponse.json(
          {
            error: "Failed to upgrade role",
            details: roleError.message,
          },
          { status: 500 },
        )
      }

      const trialEndsAt = new Date()
      trialEndsAt.setMonth(trialEndsAt.getMonth() + 3)

      const { error: profileError } = await supabase.from("organizer_profiles").upsert(
        {
          user_id: user.id,
          business_name: businessName || null,
          email: contactEmail,
          trial_started_at: new Date().toISOString(),
          trial_ends_at: trialEndsAt.toISOString(),
          is_trial_active: true,
          subscription_status: "trial",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        },
      )

      if (profileError) {
        console.error("[v0] Failed to create organizer profile:", profileError)
        return NextResponse.json(
          {
            error: "Failed to create organizer profile",
            details: profileError.message,
          },
          { status: 500 },
        )
      }

      console.log("[v0] ORGANIZER_UPGRADE_SUCCESS", {
        userId: user.id,
        email: user.email,
        businessName,
        trialEndsAt: trialEndsAt.toISOString(),
      })

      return NextResponse.json({
        success: true,
        message: "Upgraded to organizer",
        trialEndsAt: trialEndsAt.toISOString(),
      })
    }

    // If not in beta, require payment (not implemented yet)
    return NextResponse.json({ error: "Payment required" }, { status: 402 })
  } catch (error: any) {
    console.error("[v0] Upgrade error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error?.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}
