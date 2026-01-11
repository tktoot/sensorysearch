import { type NextRequest, NextResponse } from "next/server"
import { getServerUser } from "@/lib/auth-server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user || (user.role !== "organizer" && user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      type,
      title,
      denomination, // Added for place_of_worship
      description,
      address,
      date,
      time,
      serviceTimes, // Added for place_of_worship
      hours,
      website,
      contactEmail,
      phone,
      sensoryAttributes,
      images,
    } = body

    if (!type || !["event", "venue", "park", "playground", "place_of_worship"].includes(type)) {
      return NextResponse.json({ error: "Invalid submission type" }, { status: 400 })
    }

    // Validate required fields
    if (!type || !title || !description || !address) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    const submissionData: any = {
      type,
      title,
      description,
      address: `${address.street}, ${address.city}, ${address.state} ${address.zip}`,
      city: address.city,
      state: address.state,
      zip: address.zip,
      website: website || null,
      email: contactEmail || null,
      phone: phone || null,
      sensory_features: sensoryAttributes ? Object.keys(sensoryAttributes).filter((k) => sensoryAttributes[k]) : [],
      images: images || [],
      status: "pending",
      organizer_id: user.id,
      submitted_at: new Date().toISOString(),
    }

    // Add type-specific fields
    if (type === "event") {
      submissionData.event_date = date || null
      submissionData.event_start_time = time || null
    } else if (type === "place_of_worship") {
      submissionData.category = denomination || "Non-denominational"
      submissionData.venue_name = serviceTimes || null // Store service times in venue_name for now
    } else {
      submissionData.hours = hours || null
    }

    const { data: submission, error } = await supabase.from("listings").insert(submissionData).select().single()

    if (error) {
      console.error("[v0] Database error:", error)
      return NextResponse.json({ error: "Failed to create submission" }, { status: 500 })
    }

    try {
      await fetch(`${request.nextUrl.origin}/api/notify-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          listing: submission,
          submittedBy: user.email,
        }),
      })
    } catch (emailError) {
      console.error("[v0] Email notification failed:", emailError)
      // Don't fail the submission if email fails
    }

    console.log("[v0] SUBMISSION_CREATED", {
      id: submission.id,
      type,
      title,
      submitter: user.email,
    })

    return NextResponse.json({ success: true, id: submission.id })
  } catch (error) {
    console.error("[v0] Submission error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
