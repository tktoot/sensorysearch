export interface FeedbackRating {
  id: string
  listingId: string // event or venue
  userId?: string | null
  sessionId: string // 'ss_session' cookie
  value: number // 1–5
  createdAt: string
}

export interface RatingAggregate {
  listingId: string
  avg: number
  count: number
  distribution: Record<number, number> // { 1: count, 2: count, ... }
}
