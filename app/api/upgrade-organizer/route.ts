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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // During beta, upgrade is free - just update role
    if (BETA_ENABLED) {
      const { error } = await supabase
        .from("users")
        .update({
          role: "organizer",
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) {
        console.error("[v0] Failed to upgrade user:", error)
        return NextResponse.json({ error: "Failed to upgrade" }, { status: 500 })
      }

      // Create organizer profile with 3-month trial
      const trialEndsAt = new Date()
      trialEndsAt.setMonth(trialEndsAt.getMonth() + 3)

      const { error: profileError } = await supabase.from("organizer_profiles").upsert(
        {
          user_id: user.id,
          email: user.email,
          trial_started_at: new Date().toISOString(),
          trial_ends_at: trialEndsAt.toISOString(),
          is_trial_active: true,
          subscription_status: "trial",
        },
        {
          onConflict: "user_id",
        },
      )

      if (profileError) {
        console.warn("[v0] Failed to create organizer profile:", profileError)
      }

      console.log("[v0] ORGANIZER_UPGRADE_SUCCESS", {
        userId: user.id,
        email: user.email,
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
  } catch (error) {
    console.error("[v0] Upgrade error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
