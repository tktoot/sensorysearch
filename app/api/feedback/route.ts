import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Rate limiting store (in-memory for demo, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(identifier: string): boolean {
  const now = Date.now()
  const limit = rateLimitStore.get(identifier)

  if (!limit || now > limit.resetAt) {
    rateLimitStore.set(identifier, { count: 1, resetAt: now + 3600000 }) // 1 hour
    return true
  }

  if (limit.count >= 3) {
    return false
  }

  limit.count++
  return true
}

function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0] : "unknown"
  return ip
}

// POST /api/feedback - Create new feedback
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { listingId, listingType, message, authorEmail, allowReply, honeypot, organizerUserId } = body

    // Anti-spam: Check honeypot
    if (honeypot) {
      console.log("[v0] FEEDBACK_SPAM_DETECTED - Honeypot filled")
      return NextResponse.json({ success: true }) // Silently drop
    }

    // Validate required fields
    if (!listingId || !listingType || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate listing type
    if (!["event", "venue"].includes(listingType)) {
      return NextResponse.json({ error: "Invalid listing type" }, { status: 400 })
    }

    // Validate message length
    const trimmedMessage = message.trim()
    if (trimmedMessage.length === 0 || trimmedMessage.length > 500) {
      return NextResponse.json({ error: "Message must be between 1 and 500 characters" }, { status: 400 })
    }

    // Rate limiting
    const identifier = getClientIdentifier(request)
    if (!checkRateLimit(identifier)) {
      return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 })
    }

    // Get current user (if authenticated)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Simple profanity filter (basic example)
    const profanityWords = ["spam", "scam", "fake"]
    const flagged = profanityWords.some((word) => trimmedMessage.toLowerCase().includes(word))

    // Insert feedback
    const { data, error } = await supabase
      .from("feedback")
      .insert({
        listing_id: listingId,
        listing_type: listingType,
        message: trimmedMessage,
        author_user_id: user?.id || null,
        author_email: authorEmail || null,
        allow_reply: allowReply !== false,
        status: "new",
        flagged,
        organizer_user_id: organizerUserId || null,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] FEEDBACK_CREATE_ERROR", error)
      return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 })
    }

    console.log("[v0] FEEDBACK_CREATED", { id: data.id, listingId, listingType })

    // TODO: Send email notifications to admin and organizer
    // This would be implemented with a service like SendGrid or Resend

    return NextResponse.json({ success: true, id: data.id })
  } catch (error) {
    console.error("[v0] FEEDBACK_API_ERROR", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET /api/feedback - List feedback (admin/organizer only)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

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

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const listingType = searchParams.get("listingType")
    const status = searchParams.get("status")
    const organizerId = searchParams.get("organizerId")

    // Build query
    let query = supabase.from("feedback").select("*").order("created_at", { ascending: false })

    // Apply filters
    if (listingType) {
      query = query.eq("listing_type", listingType)
    }

    if (status) {
      query = query.eq("status", status)
    }

    // If organizer, only show their feedback
    if (userData.role === "organizer") {
      query = query.eq("organizer_user_id", user.id)
    } else if (organizerId) {
      // Admin can filter by organizer
      query = query.eq("organizer_user_id", organizerId)
    }

    const { data, error } = await query

    if (error) {
      console.error("[v0] FEEDBACK_LIST_ERROR", error)
      return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 })
    }

    return NextResponse.json({ feedback: data })
  } catch (error) {
    console.error("[v0] FEEDBACK_API_ERROR", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
