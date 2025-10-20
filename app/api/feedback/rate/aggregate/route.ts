import { type NextRequest, NextResponse } from "next/server"
import { ratingsStore } from "@/lib/ratingsStore"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const listingId = searchParams.get("listingId")

    if (!listingId) {
      return NextResponse.json({ error: "Missing listingId" }, { status: 400 })
    }

    const aggregate = ratingsStore.getAggregate(listingId)

    if (!aggregate) {
      return NextResponse.json({ avg: null, count: 0, distribution: {} })
    }

    return NextResponse.json(aggregate)
  } catch (error) {
    console.error("[v0] Error fetching aggregate:", error)
    return NextResponse.json({ error: "Failed to fetch aggregate" }, { status: 500 })
  }
}
