import { type NextRequest, NextResponse } from "next/server"
import { getServerUser } from "@/lib/auth-server"
import { sendSubmissionNotification } from "@/lib/email-utils"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    // Check auth
    const user = await getServerUser()
    if (!user || (user.role !== "organizer" && user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      type,
      title,
      description,
      address,
      date,
      time,
      hours,
      website,
      contactEmail,
      phone,
      sensoryAttributes,
      images,
    } = body

    // Validate required fields
    if (!type || !title || !description || !address) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create submission in database
    const supabase = await createClient()
    const { data: submission, error } = await supabase
      .from("listings")
      .insert({
        type,
        title,
        description,
        address: `${address.street}, ${address.city}, ${address.state} ${address.zip}`,
        city: address.city,
        state: address.state,
        zip: address.zip,
        date: date || null,
        time: time || null,
        hours: hours || null,
        website: website || null,
        contact_email: contactEmail || null,
        phone: phone || null,
        sensory_attributes: sensoryAttributes,
        images: images || [],
        status: "pending",
        submitted_by: user.id,
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Database error:", error)
      return NextResponse.json({ error: "Failed to create submission" }, { status: 500 })
    }

    // Send email notification
    const emailSent = await sendSubmissionNotification({
      title,
      type: type.charAt(0).toUpperCase() + type.slice(1),
      submitterEmail: user.email,
      submissionId: submission.id,
      images,
      address: `${address.street}, ${address.city}, ${address.state} ${address.zip}`,
      date: date ? `${date} at ${time}` : undefined,
    })

    if (!emailSent) {
      console.warn("[v0] Email notification failed, but submission was saved")
    }

    console.log("[v0] SUBMISSION_CREATED", {
      id: submission.id,
      type,
      title,
      submitter: user.email,
      emailSent,
    })

    return NextResponse.json({ success: true, id: submission.id })
  } catch (error) {
    console.error("[v0] Submission error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
