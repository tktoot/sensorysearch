import { type NextRequest, NextResponse } from "next/server"
import { ratingsStore } from "@/lib/ratingsStore"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const listingId = searchParams.get("listingId")
    const sessionId = searchParams.get("sessionId")

    if (!listingId || !sessionId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const existingRating = ratingsStore.getUserRating(listingId, sessionId)

    if (existingRating) {
      return NextResponse.json({ hasRated: true, value: existingRating.value })
    }

    return NextResponse.json({ hasRated: false })
  } catch (error) {
    console.error("[v0] Error checking rating:", error)
    return NextResponse.json({ error: "Failed to check rating" }, { status: 500 })
  }
}
