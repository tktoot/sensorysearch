import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, source, zip } = body

    if (!email || !source) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Basic email validation
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Valid sources
    const validSources = ["favorites", "alerts", "resource_download", "organizer_submit", "beta_signup"]
    if (!validSources.includes(source)) {
      return NextResponse.json({ error: "Invalid source" }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Try to insert, handle duplicate gracefully
    const { data, error } = await adminClient
      .from("email_signups")
      .insert({
        email: email.toLowerCase().trim(),
        source,
        zip: zip || null,
      })
      .select()
      .single()

    if (error) {
      // If duplicate, just return success
      if (error.code === "23505") {
        console.log("[v0] Email already exists:", email)
        return NextResponse.json({ success: true, message: "Email already registered" })
      }

      console.error("[v0] Email signup error:", error)
      return NextResponse.json({ error: "Failed to save email" }, { status: 500 })
    }

    console.log("[v0] EMAIL_SIGNUP_CREATED", {
      id: data.id,
      email,
      source,
    })

    return NextResponse.json({ success: true, id: data.id })
  } catch (error) {
    console.error("[v0] Email signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
