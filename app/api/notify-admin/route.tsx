import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { BETA_NOTIFY_EMAIL } from "@/lib/config"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { type, listing, submittedBy } = await request.json()

    if (!process.env.RESEND_API_KEY) {
      console.log("[v0] RESEND_API_KEY not set, skipping email notification")
      return NextResponse.json({ success: true, skipped: true })
    }

    const subject = `New ${type} submission: ${listing.title}`
    const html = `
      <h2>New ${type.charAt(0).toUpperCase() + type.slice(1)} Submission</h2>
      <p><strong>Title:</strong> ${listing.title}</p>
      <p><strong>Submitted by:</strong> ${submittedBy}</p>
      <p><strong>Description:</strong> ${listing.description || "N/A"}</p>
      <p><strong>Address:</strong> ${listing.address || "N/A"}</p>
      ${listing.website ? `<p><strong>Website:</strong> ${listing.website}</p>` : ""}
      ${listing.images?.length > 0 ? `<p><strong>Images:</strong> ${listing.images.length} uploaded</p>` : ""}
      <p><strong>Status:</strong> Pending Review</p>
      <p><a href="${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/admin">Review in Admin Dashboard</a></p>
    `

    const { data, error } = await resend.emails.send({
      from: "SensorySearch <notifications@sensorysearch.com>",
      to: BETA_NOTIFY_EMAIL,
      subject,
      html,
    })

    if (error) {
      console.error("[v0] Email send error:", error)
      throw error
    }

    console.log("[v0] Admin notification sent:", data?.id)

    return NextResponse.json({ success: true, emailId: data?.id })
  } catch (error) {
    console.error("[v0] Notify admin error:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
