import { createAdminClient } from "@/lib/supabase-admin"
import { createClient } from "@/lib/supabase/server"
import { ADMIN_EMAILS } from "@/lib/config"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() || "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { listingId, reason } = await request.json()

    if (!listingId) {
      return NextResponse.json({ error: "Missing listing ID" }, { status: 400 })
    }

    const adminClient = createAdminClient()

    const { error } = await adminClient
      .from("listings")
      .update({
        status: "rejected",
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        rejection_reason: reason || null,
      })
      .eq("id", listingId)

    if (error) {
      console.error("[v0] Reject error:", error)
      throw error
    }

    console.log("[v0] Listing rejected:", listingId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Reject error:", error)
    return NextResponse.json({ error: "Failed to reject" }, { status: 500 })
  }
}
