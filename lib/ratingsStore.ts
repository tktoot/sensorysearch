import { v4 as uuidv4 } from "uuid"
import type { FeedbackRating, RatingAggregate } from "./ratings-types"

const RATINGS_STORAGE_KEY = "ss_ratings"
const AGGREGATES_STORAGE_KEY = "ss_rating_aggregates"

class RatingsStore {
  private ratings: FeedbackRating[] = []
  private aggregates: Map<string, RatingAggregate> = new Map()

  constructor() {
    if (typeof window !== "undefined") {
      this.loadFromStorage()
    }
  }

  private loadFromStorage() {
    try {
      const ratingsData = localStorage.getItem(RATINGS_STORAGE_KEY)
      if (ratingsData) {
        this.ratings = JSON.parse(ratingsData)
      }

      const aggregatesData = localStorage.getItem(AGGREGATES_STORAGE_KEY)
      if (aggregatesData) {
        const parsed = JSON.parse(aggregatesData)
        this.aggregates = new Map(Object.entries(parsed))
      }
    } catch (error) {
      console.error("[v0] Failed to load ratings from storage:", error)
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(RATINGS_STORAGE_KEY, JSON.stringify(this.ratings))
      localStorage.setItem(AGGREGATES_STORAGE_KEY, JSON.stringify(Object.fromEntries(this.aggregates)))
    } catch (error) {
      console.error("[v0] Failed to save ratings to storage:", error)
    }
  }

  addRating(listingId: string, sessionId: string, value: number, userId?: string): FeedbackRating {
    // Check for existing rating from this session in the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const existingIndex = this.ratings.findIndex(
      (r) => r.listingId === listingId && r.sessionId === sessionId && r.createdAt > oneDayAgo,
    )

    const rating: FeedbackRating = {
      id: existingIndex >= 0 ? this.ratings[existingIndex].id : uuidv4(),
      listingId,
      sessionId,
      userId: userId || null,
      value,
      createdAt: new Date().toISOString(),
    }

    if (existingIndex >= 0) {
      // Update existing rating
      this.ratings[existingIndex] = rating
    } else {
      // Add new rating
      this.ratings.push(rating)
    }

    // Update aggregate
    this.updateAggregate(listingId)
    this.saveToStorage()

    return rating
  }

  private updateAggregate(listingId: string) {
    const listingRatings = this.ratings.filter((r) => r.listingId === listingId)

    if (listingRatings.length === 0) {
      this.aggregates.delete(listingId)
      return
    }

    const sum = listingRatings.reduce((acc, r) => acc + r.value, 0)
    const avg = sum / listingRatings.length

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    listingRatings.forEach((r) => {
      distribution[r.value] = (distribution[r.value] || 0) + 1
    })

    this.aggregates.set(listingId, {
      listingId,
      avg: Math.round(avg * 10) / 10, // Round to 1 decimal
      count: listingRatings.length,
      distribution,
    })
  }

  getAggregate(listingId: string): RatingAggregate | null {
    return this.aggregates.get(listingId) || null
  }

  getAllAggregates(): RatingAggregate[] {
    return Array.from(this.aggregates.values())
  }

  getUserRating(listingId: string, sessionId: string): FeedbackRating | null {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    return (
      this.ratings.find((r) => r.listingId === listingId && r.sessionId === sessionId && r.createdAt > oneDayAgo) ||
      null
    )
  }
}

// Singleton instance
export const ratingsStore = new RatingsStore()
