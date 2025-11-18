import { createAdminClient } from "@/lib/supabase-admin"
import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { logApiRequest, logApiSuccess, logApiError } from "@/lib/api-logger"

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const { listingId, listingType } = await request.json()

    if (!listingId) {
      return NextResponse.json({ error: "Missing listingId" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    logApiRequest({
      route: "/api/analytics/view",
      method: "POST",
      userId: user?.id,
      body: { listingId, listingType },
    })

    const adminClient = createAdminClient()

    // Track the view in analytics_views table
    await adminClient.from("analytics_views").insert({
      listing_id: listingId,
      listing_type: listingType || "unknown",
      user_id: user?.id || null,
      viewed_at: new Date().toISOString(),
    })

    const duration = Date.now() - startTime
    logApiSuccess({
      route: "/api/analytics/view",
      method: "POST",
      userId: user?.id,
      duration,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Analytics view error:", error)
    logApiError({
      route: "/api/analytics/view",
      method: "POST",
      error,
    })
    return NextResponse.json({ error: "Failed to track view" }, { status: 500 })
  }
}
