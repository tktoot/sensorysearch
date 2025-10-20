export interface PageMetric {
  id: string
  path: string
  views: number
  uniques: Set<string> // Session IDs
  totalTime: number // Total time spent in ms
  avgTime: number // Average time in ms
  date: string // YYYY-MM-DD
  searches?: Map<string, number> // Search queries and counts
  clicks?: Map<string, number> // Click targets and counts
}

class PageMetricsStore {
  private metrics: Map<string, PageMetric> = new Map()
  private readonly STORAGE_KEY = "ss_page_metrics"

  constructor() {
    if (typeof window !== "undefined") {
      this.loadFromStorage()
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        // Reconstruct Maps and Sets
        this.metrics = new Map(
          data.map((m: any) => [
            m.id,
            {
              ...m,
              uniques: new Set(m.uniques),
              searches: m.searches ? new Map(Object.entries(m.searches)) : new Map(),
              clicks: m.clicks ? new Map(Object.entries(m.clicks)) : new Map(),
            },
          ]),
        )
      }
    } catch (e) {
      console.error("[v0] Failed to load page metrics:", e)
    }
  }

  private saveToStorage() {
    try {
      // Convert Maps and Sets to plain objects for storage
      const data = Array.from(this.metrics.values()).map((m) => ({
        ...m,
        uniques: Array.from(m.uniques),
        searches: m.searches ? Object.fromEntries(m.searches) : {},
        clicks: m.clicks ? Object.fromEntries(m.clicks) : {},
      }))
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      console.error("[v0] Failed to save page metrics:", e)
    }
  }

  trackPageView(path: string, sessionId: string, timeSpent?: number) {
    const today = new Date().toISOString().split("T")[0]
    const key = `${path}_${today}`

    let metric = this.metrics.get(key)
    if (!metric) {
      metric = {
        id: key,
        path,
        views: 0,
        uniques: new Set(),
        totalTime: 0,
        avgTime: 0,
        date: today,
        searches: new Map(),
        clicks: new Map(),
      }
      this.metrics.set(key, metric)
    }

    metric.views++
    metric.uniques.add(sessionId)

    if (timeSpent) {
      metric.totalTime += timeSpent
      metric.avgTime = metric.totalTime / metric.views
    }

    this.saveToStorage()
  }

  trackSearch(query: string, sessionId: string) {
    const today = new Date().toISOString().split("T")[0]
    const key = `/discover_${today}`

    let metric = this.metrics.get(key)
    if (!metric) {
      metric = {
        id: key,
        path: "/discover",
        views: 0,
        uniques: new Set(),
        totalTime: 0,
        avgTime: 0,
        date: today,
        searches: new Map(),
        clicks: new Map(),
      }
      this.metrics.set(key, metric)
    }

    const currentCount = metric.searches?.get(query) || 0
    metric.searches?.set(query, currentCount + 1)

    this.saveToStorage()
  }

  trackClick(target: string, path: string, sessionId: string) {
    const today = new Date().toISOString().split("T")[0]
    const key = `${path}_${today}`

    let metric = this.metrics.get(key)
    if (!metric) {
      metric = {
        id: key,
        path,
        views: 0,
        uniques: new Set(),
        totalTime: 0,
        avgTime: 0,
        date: today,
        searches: new Map(),
        clicks: new Map(),
      }
      this.metrics.set(key, metric)
    }

    const currentCount = metric.clicks?.get(target) || 0
    metric.clicks?.set(target, currentCount + 1)

    this.saveToStorage()
  }

  getMetrics(days = 7): PageMetric[] {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    const cutoffStr = cutoff.toISOString().split("T")[0]

    return Array.from(this.metrics.values())
      .filter((m) => m.date >= cutoffStr)
      .map((m) => ({
        ...m,
        uniques: m.uniques.size, // Convert Set to count for display
      })) as any
  }

  getTopPages(limit = 10): Array<{ path: string; views: number; uniques: number }> {
    const aggregated = new Map<string, { views: number; uniques: Set<string> }>()

    for (const metric of this.metrics.values()) {
      const existing = aggregated.get(metric.path)
      if (existing) {
        existing.views += metric.views
        metric.uniques.forEach((id) => existing.uniques.add(id))
      } else {
        aggregated.set(metric.path, {
          views: metric.views,
          uniques: new Set(metric.uniques),
        })
      }
    }

    return Array.from(aggregated.entries())
      .map(([path, data]) => ({
        path,
        views: data.views,
        uniques: data.uniques.size,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, limit)
  }

  getTopSearches(limit = 10): Array<{ query: string; count: number }> {
    const aggregated = new Map<string, number>()

    for (const metric of this.metrics.values()) {
      if (metric.searches) {
        for (const [query, count] of metric.searches.entries()) {
          aggregated.set(query, (aggregated.get(query) || 0) + count)
        }
      }
    }

    return Array.from(aggregated.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }

  getTopClicks(limit = 10): Array<{ target: string; count: number }> {
    const aggregated = new Map<string, number>()

    for (const metric of this.metrics.values()) {
      if (metric.clicks) {
        for (const [target, count] of metric.clicks.entries()) {
          aggregated.set(target, (aggregated.get(target) || 0) + count)
        }
      }
    }

    return Array.from(aggregated.entries())
      .map(([target, count]) => ({ target, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }
}

export const pageMetricsStore = new PageMetricsStore()
