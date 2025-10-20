import { createAdminClient } from "@/lib/supabase-admin"
import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { type: string } }) {
  try {
    const { type } = params

    if (!["venue", "event", "park"].includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const adminClient = createAdminClient()

    // Build listing data
    const listingData = {
      type,
      status: "pending",
      title: body.title,
      description: body.description,
      address: typeof body.address === "string" ? body.address : body.address?.street,
      city: typeof body.address === "string" ? "" : body.address?.city,
      state: typeof body.address === "string" ? "" : body.address?.state,
      zip: typeof body.address === "string" ? "" : body.address?.zip,
      website: body.website || null,
      email: body.contactEmail || user.email,
      phone: body.phone || null,
      social_link: body.socialLink || null,
      images: body.images || [],
      sensory_features: body.sensoryAttributes
        ? Object.entries(body.sensoryAttributes)
            .filter(([_, value]) => value === true)
            .map(([key]) => key)
        : [],
      crowd_level: body.crowdLevel || null,
      accessibility_notes: body.accessibilityNotes || null,
      organizer_id: user.id,
      organizer_email: user.email,
      submitted_at: new Date().toISOString(),
      source: "web",
    }

    // Add event-specific fields
    if (type === "event") {
      Object.assign(listingData, {
        event_date: body.date || null,
        event_start_time: body.startTime || null,
        event_end_time: body.endTime || null,
        venue_name: body.venueName || null,
      })
    }

    const { data: listing, error } = await adminClient.from("listings").insert(listingData).select().single()

    if (error) {
      console.error("[v0] Insert error:", error)
      throw error
    }

    // Track submission in analytics
    await adminClient.from("analytics_clicks").insert({
      item_type: type,
      item_id: listing.id,
      user_id: user.id,
    })

    // Send notification email
    await fetch(`${request.nextUrl.origin}/api/notify-admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        listing,
        submittedBy: user.email,
      }),
    })

    console.log("[v0] Submission created:", listing.id)

    return NextResponse.json({ success: true, id: listing.id })
  } catch (error) {
    console.error("[v0] Submission error:", error)
    return NextResponse.json({ error: "Submission failed" }, { status: 500 })
  }
}
