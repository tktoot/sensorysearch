/**
 * Analytics Data Models
 *
 * Defines types for event tracking and metrics aggregation
 */

export interface EventMetricDaily {
  id: string // uuid
  eventId: string
  date: string // yyyy-mm-dd
  views: number // list/grid impressions
  detailClicks: number // opened details
  favorites: number // saved/hearted
  calendarAdds: number // optional
  uniqueViewers: number // de-duplicated sessions/users per day
}

export interface SessionRef {
  id: string // randomly generated, cookie `ss_session`
  userId?: string | null
  createdAt: string
}

export type TrackingEventType = "view" | "detailClick" | "favorite" | "calendarAdd"

export interface TrackingPayload {
  eventId: string
  type: TrackingEventType
}
