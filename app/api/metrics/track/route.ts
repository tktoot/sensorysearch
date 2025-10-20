/**
 * Metrics Tracking API
 *
 * Handles tracking requests from the client
 */

import { NextResponse } from "next/server"
import { getSessionIdFromRequest } from "@/lib/session"
import { upsertDailyMetric, isFingerprintSeen, saveFingerprint, getTodayDateString } from "@/lib/metricsStore"
import { ANALYTICS_ENABLED } from "@/lib/config"
import type { TrackingPayload } from "@/lib/analytics-types"

export async function POST(request: Request) {
  try {
    // Check if analytics is enabled
    if (!ANALYTICS_ENABLED) {
      return NextResponse.json({ ok: true, disabled: true }, { status: 200 })
    }

    // Parse request body
    const body = (await request.json()) as TrackingPayload
    const { eventId, type } = body

    // Validate input
    if (!eventId || !["view", "detailClick", "favorite", "calendarAdd"].includes(type)) {
      return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 })
    }

    // Get session ID
    const sessionId = getSessionIdFromRequest(request)
    const date = getTodayDateString()

    // Create fingerprint for deduplication
    const fpKey = `${eventId}:${date}:${sessionId}:${type}`

    // Check if already tracked
    if (await isFingerprintSeen(fpKey)) {
      return NextResponse.json({ ok: true, deduped: true }, { status: 200 })
    }

    // Save fingerprint
    await saveFingerprint(fpKey)

    // Update metrics
    await upsertDailyMetric(eventId, date, (m) => {
      if (type === "view") {
        m.views++
        m.uniqueViewers++ // Count unique viewers on first view per session/day
      }
      if (type === "detailClick") m.detailClicks++
      if (type === "favorite") m.favorites++
      if (type === "calendarAdd") m.calendarAdds++
      return m
    })

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (e) {
    console.error("[v0] Metrics tracking error:", e)
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 })
  }
}
