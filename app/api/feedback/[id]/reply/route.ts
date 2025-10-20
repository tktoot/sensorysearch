import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { id } = params
    const body = await request.json()
    const { message } = body

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user role
    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (!userData || !["admin", "organizer"].includes(userData.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Validate message
    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Get feedback to check permissions and get author email
    const { data: feedback, error: feedbackError } = await supabase.from("feedback").select("*").eq("id", id).single()

    if (feedbackError || !feedback) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 })
    }

    // Check if organizer owns this feedback
    if (userData.role === "organizer" && feedback.organizer_user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Check if reply is allowed
    if (!feedback.allow_reply || !feedback.author_email) {
      return NextResponse.json({ error: "Reply not allowed or no contact provided" }, { status: 400 })
    }

    // Insert reply
    const { data: reply, error: replyError } = await supabase
      .from("feedback_replies")
      .insert({
        feedback_id: id,
        message: message.trim(),
        author_user_id: user.id,
      })
      .select()
      .single()

    if (replyError) {
      console.error("[v0] FEEDBACK_REPLY_ERROR", replyError)
      return NextResponse.json({ error: "Failed to send reply" }, { status: 500 })
    }

    // TODO: Send email to feedback author
    // This would be implemented with a service like SendGrid or Resend

    console.log("[v0] FEEDBACK_REPLY_SENT", { feedbackId: id, replyId: reply.id })

    return NextResponse.json({ success: true, reply })
  } catch (error) {
    console.error("[v0] FEEDBACK_REPLY_API_ERROR", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
