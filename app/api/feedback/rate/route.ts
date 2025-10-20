import { type NextRequest, NextResponse } from "next/server"
import { ratingsStore } from "@/lib/ratingsStore"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { listingId, value, sessionId, userId } = body

    if (!listingId || !value || !sessionId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (value < 1 || value > 5) {
      return NextResponse.json({ error: "Value must be between 1 and 5" }, { status: 400 })
    }

    const rating = ratingsStore.addRating(listingId, sessionId, value, userId)

    return NextResponse.json({ success: true, rating })
  } catch (error) {
    console.error("[v0] Error submitting rating:", error)
    return NextResponse.json({ error: "Failed to submit rating" }, { status: 500 })
  }
}
