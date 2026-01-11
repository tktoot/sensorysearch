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

    // Call the approve_submission function
    const { data: result, error: approveError } = await adminClient.rpc("approve_submission", {
      submission_id: listingId,
      reviewer_id: user.id,
    })

    if (approveError) {
      console.error("[v0] Approval error:", approveError)
      return NextResponse.json(
        {
          error: "Failed to approve submission",
          details: approveError.message,
        },
        { status: 500 },
      )
    }

    console.log("[v0] Submission approved and promoted:", {
      submissionId: listingId,
      entityId: result,
      reviewedBy: user.email,
    })

    return NextResponse.json({
      success: true,
      entityId: result,
    })
  } catch (error) {
    console.error("[v0] Approve error:", error)
    return NextResponse.json({ error: "Failed to approve" }, { status: 500 })
  }
}
