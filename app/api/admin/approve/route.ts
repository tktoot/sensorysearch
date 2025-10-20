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

    const { listingId } = await request.json()

    if (!listingId) {
      return NextResponse.json({ error: "Missing listing ID" }, { status: 400 })
    }

    const adminClient = createAdminClient()

    const { error } = await adminClient
      .from("listings")
      .update({
        status: "approved",
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq("id", listingId)

    if (error) {
      console.error("[v0] Approve error:", error)
      throw error
    }

    console.log("[v0] Listing approved:", listingId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Approve error:", error)
    return NextResponse.json({ error: "Failed to approve" }, { status: 500 })
  }
}
