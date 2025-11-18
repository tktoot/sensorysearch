import { NextResponse } from "next/server"
import { BETA_NOTIFY_EMAIL } from "@/lib/config"

export async function POST(request: Request) {
  try {
    const { email, userId } = await request.json()

    console.log("[v0] NEW_USER_SIGNUP", { email, userId, notifyEmail: BETA_NOTIFY_EMAIL })

    // TODO: Implement Resend email notification
    // For now, we'll use FormSubmit as a fallback
    const formData = new FormData()
    formData.append("email", BETA_NOTIFY_EMAIL)
    formData.append("subject", "New User Signup - SensorySearch")
    formData.append(
      "message",
      `A new user has signed up!\n\nEmail: ${email}\nUser ID: ${userId}\nTime: ${new Date().toISOString()}`,
    )

    // Send via FormSubmit (free, no API key required)
    await fetch(`https://formsubmit.co/${BETA_NOTIFY_EMAIL}`, {
      method: "POST",
      body: formData,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] NOTIFY_SIGNUP_ERROR", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
