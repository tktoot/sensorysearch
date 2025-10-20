/**
 * Metrics Storage
 *
 * In-memory storage for event metrics with localStorage persistence
 */

import type { EventMetricDaily } from "./analytics-types"
import { startOfDay, format } from "date-fns"

const METRICS_STORAGE_KEY = "ss_event_metrics"
const FINGERPRINTS_STORAGE_KEY = "ss_metric_fingerprints"

// In-memory cache
let metricsCache: Map<string, EventMetricDaily> | null = null
let fingerprintsCache: Set<string> | null = null

function getMetricsMap(): Map<string, EventMetricDaily> {
  if (metricsCache) return metricsCache

  if (typeof window === "undefined") {
    metricsCache = new Map()
    return metricsCache
  }

  try {
    const stored = localStorage.getItem(METRICS_STORAGE_KEY)
    if (stored) {
      const data = JSON.parse(stored) as EventMetricDaily[]
      metricsCache = new Map(data.map((m) => [`${m.eventId}:${m.date}`, m]))
    } else {
      metricsCache = new Map()
    }
  } catch (e) {
    console.error("[v0] Failed to load metrics from localStorage:", e)
    metricsCache = new Map()
  }

  return metricsCache
}

function getFingerprintsSet(): Set<string> {
  if (fingerprintsCache) return fingerprintsCache

  if (typeof window === "undefined") {
    fingerprintsCache = new Set()
    return fingerprintsCache
  }

  try {
    const stored = localStorage.getItem(FINGERPRINTS_STORAGE_KEY)
    if (stored) {
      const data = JSON.parse(stored) as string[]
      fingerprintsCache = new Set(data)
    } else {
      fingerprintsCache = new Set()
    }
  } catch (e) {
    console.error("[v0] Failed to load fingerprints from localStorage:", e)
    fingerprintsCache = new Set()
  }

  return fingerprintsCache
}

function saveMetrics() {
  if (typeof window === "undefined") return

  try {
    const metrics = Array.from(getMetricsMap().values())
    localStorage.setItem(METRICS_STORAGE_KEY, JSON.stringify(metrics))
  } catch (e) {
    console.error("[v0] Failed to save metrics to localStorage:", e)
  }
}

function saveFingerprints() {
  if (typeof window === "undefined") return

  try {
    const fingerprints = Array.from(getFingerprintsSet())
    localStorage.setItem(FINGERPRINTS_STORAGE_KEY, JSON.stringify(fingerprints))
  } catch (e) {
    console.error("[v0] Failed to save fingerprints to localStorage:", e)
  }
}

export async function isFingerprintSeen(fpKey: string): Promise<boolean> {
  return getFingerprintsSet().has(fpKey)
}

export async function saveFingerprint(fpKey: string): Promise<void> {
  getFingerprintsSet().add(fpKey)
  saveFingerprints()
}

export async function upsertDailyMetric(
  eventId: string,
  date: string,
  updater: (metric: EventMetricDaily) => EventMetricDaily,
): Promise<void> {
  const key = `${eventId}:${date}`
  const metrics = getMetricsMap()

  const existing = metrics.get(key) || {
    id: `${eventId}-${date}`,
    eventId,
    date,
    views: 0,
    detailClicks: 0,
    favorites: 0,
    calendarAdds: 0,
    uniqueViewers: 0,
  }

  const updated = updater(existing)
  metrics.set(key, updated)
  saveMetrics()
}

export function getMetricsForEvent(eventId: string, fromDate?: string, toDate?: string): EventMetricDaily[] {
  const metrics = Array.from(getMetricsMap().values()).filter((m) => m.eventId === eventId)

  if (!fromDate && !toDate) return metrics

  return metrics.filter((m) => {
    if (fromDate && m.date < fromDate) return false
    if (toDate && m.date > toDate) return false
    return true
  })
}

export function getMetricsForOrganizer(
  organizerId: string,
  events: Array<{ id: string; organizerId?: string }>,
  fromDate?: string,
  toDate?: string,
): EventMetricDaily[] {
  const organizerEventIds = events.filter((e) => e.organizerId === organizerId).map((e) => e.id)

  const metrics = Array.from(getMetricsMap().values()).filter((m) => organizerEventIds.includes(m.eventId))

  if (!fromDate && !toDate) return metrics

  return metrics.filter((m) => {
    if (fromDate && m.date < fromDate) return false
    if (toDate && m.date > toDate) return false
    return true
  })
}

export function getTodayDateString(): string {
  return format(startOfDay(new Date()), "yyyy-MM-dd")
}
