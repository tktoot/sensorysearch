import { createAdminClient } from "@/lib/supabase-admin"
import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { logApiRequest, logApiSuccess, logApiError } from "@/lib/api-logger"

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const { listingId, listingType, action } = await request.json()

    if (!listingId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    logApiRequest({
      route: "/api/analytics/favorite",
      method: "POST",
      userId: user?.id,
      body: { listingId, listingType, action },
    })

    const adminClient = createAdminClient()

    if (action === "add") {
      // Track the favorite in analytics_favorites table
      await adminClient.from("analytics_favorites").insert({
        listing_id: listingId,
        listing_type: listingType || "unknown",
        user_id: user?.id || null,
        favorited_at: new Date().toISOString(),
      })
    } else if (action === "remove") {
      // Remove the favorite
      await adminClient
        .from("analytics_favorites")
        .delete()
        .eq("listing_id", listingId)
        .eq("user_id", user?.id || null)
    }

    const duration = Date.now() - startTime
    logApiSuccess({
      route: "/api/analytics/favorite",
      method: "POST",
      userId: user?.id,
      duration,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Analytics favorite error:", error)
    logApiError({
      route: "/api/analytics/favorite",
      method: "POST",
      error,
    })
    return NextResponse.json({ error: "Failed to track favorite" }, { status: 500 })
  }
}
