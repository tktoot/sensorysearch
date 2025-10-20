import { type NextRequest, NextResponse } from "next/server"
import { pageMetricsStore } from "@/lib/pageMetricsStore"
import { ANALYTICS_ENABLED } from "@/lib/config"

export async function POST(request: NextRequest) {
  if (!ANALYTICS_ENABLED) {
    return NextResponse.json({ success: false, message: "Analytics disabled" }, { status: 200 })
  }

  try {
    const { path, sessionId, timeSpent, type, target, query } = await request.json()

    if (!path || !sessionId) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Track different types of events
    if (type === "search" && query) {
      pageMetricsStore.trackSearch(query, sessionId)
    } else if (type === "click" && target) {
      pageMetricsStore.trackClick(target, path, sessionId)
    } else {
      // Regular page view
      pageMetricsStore.trackPageView(path, sessionId, timeSpent)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Analytics error:", error)
    return NextResponse.json({ success: false, message: "Internal error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  if (!ANALYTICS_ENABLED) {
    return NextResponse.json({ success: false, message: "Analytics disabled" }, { status: 200 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "pages"
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    let data
    if (type === "pages") {
      data = pageMetricsStore.getTopPages(limit)
    } else if (type === "searches") {
      data = pageMetricsStore.getTopSearches(limit)
    } else if (type === "clicks") {
      data = pageMetricsStore.getTopClicks(limit)
    } else {
      data = pageMetricsStore.getMetrics(7)
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] Analytics error:", error)
    return NextResponse.json({ success: false, message: "Internal error" }, { status: 500 })
  }
}
