"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getOrCreateSessionId } from "@/lib/session"
import { Check } from "lucide-react"

const EXPERIENCE_LEVELS = [
  { value: 1, emoji: "😕", label: "Needs work", color: "from-red-200 to-red-300" },
  { value: 2, emoji: "🙂", label: "Okay", color: "from-orange-200 to-yellow-200" },
  { value: 3, emoji: "😊", label: "Good", color: "from-green-200 to-teal-200" },
  { value: 4, emoji: "😄", label: "Great", color: "from-blue-200 to-indigo-200" },
  { value: 5, emoji: "⭐️", label: "Perfect", color: "from-purple-200 to-pink-200" },
]

interface ExperienceSliderProps {
  listingId: string
  listingType: "event" | "venue"
}

export function ExperienceSlider({ listingId, listingType }: ExperienceSliderProps) {
  const [value, setValue] = useState(3)
  const [submitted, setSubmitted] = useState(false)
  const [aggregate, setAggregate] = useState<{ avg: number; count: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasExistingRating, setHasExistingRating] = useState(false)

  useEffect(() => {
    // Check if user already rated this listing
    const sessionId = getOrCreateSessionId()
    fetch(`/api/feedback/rate/check?listingId=${listingId}&sessionId=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.hasRated) {
          setHasExistingRating(true)
          setSubmitted(true)
          setValue(data.value)
        }
      })
      .catch((err) => console.error("[v0] Failed to check existing rating:", err))

    // Load aggregate
    loadAggregate()
  }, [listingId])

  const loadAggregate = async () => {
    try {
      const res = await fetch(`/api/feedback/rate/aggregate?listingId=${listingId}`)
      const data = await res.json()
      if (data.avg) {
        setAggregate(data)
      }
    } catch (err) {
      console.error("[v0] Failed to load aggregate:", err)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const sessionId = getOrCreateSessionId()
      const res = await fetch("/api/feedback/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, value, sessionId }),
      })

      if (res.ok) {
        setSubmitted(true)
        await loadAggregate()
      }
    } catch (err) {
      console.error("[v0] Failed to submit rating:", err)
    } finally {
      setLoading(false)
    }
  }

  const currentLevel = EXPERIENCE_LEVELS.find((l) => l.value === value) || EXPERIENCE_LEVELS[2]

  if (submitted) {
    return (
      <Card className="border-accent/50 bg-accent/5 max-w-[520px] mx-auto">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Check className="h-5 w-5 text-accent" />
            {hasExistingRating ? "Your feedback" : "Thanks for your feedback!"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pb-4">
          <div
            className={`flex items-center justify-center gap-3 rounded-lg bg-gradient-to-r p-3 ${currentLevel.color}`}
          >
            <span className="text-lg">{currentLevel.emoji}</span>
            <div>
              <p className="font-semibold text-foreground text-sm">{currentLevel.label}</p>
              <p className="text-xs text-muted-foreground">Your rating</p>
            </div>
          </div>

          {aggregate && aggregate.count > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-center text-muted-foreground">Community average</p>
              <div className="flex items-center justify-center gap-2">
                <div className="flex gap-1">
                  {EXPERIENCE_LEVELS.map((level) => (
                    <span
                      key={level.value}
                      className={`text-base transition-opacity ${
                        level.value <= Math.round(aggregate.avg) ? "opacity-100" : "opacity-20"
                      }`}
                    >
                      {level.emoji}
                    </span>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {aggregate.avg.toFixed(1)} ({aggregate.count} {aggregate.count === 1 ? "rating" : "ratings"})
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-[520px] mx-auto mt-4 px-4 sm:px-0">
      <CardHeader className="pb-2 px-4 sm:px-6 pt-4">
        <CardTitle
          className="text-lg font-semibold leading-tight"
          aria-label={`How sensory-friendly was this ${listingType}?`}
        >
          How sensory-friendly was this {listingType}?
        </CardTitle>
        <p className="text-[13px] text-muted-foreground mt-1">Rate your visit to help others</p>
      </CardHeader>
      <CardContent className="space-y-3 px-4 sm:px-6 pb-4">
        {/* Slider */}
        <div className="space-y-2">
          <div className={`rounded-lg bg-gradient-to-r p-4 transition-all duration-150 ${currentLevel.color}`}>
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-lg">{currentLevel.emoji}</span>
              <p className="font-semibold text-foreground text-center text-sm">{currentLevel.label}</p>
            </div>
          </div>

          <div className="relative py-2">
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={value}
              onChange={(e) => setValue(Number.parseInt(e.target.value))}
              className="w-full h-4 appearance-none bg-transparent cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-primary
                [&::-webkit-slider-thumb]:shadow-md
                [&::-webkit-slider-thumb]:transition-transform
                [&::-webkit-slider-thumb]:hover:scale-110
                [&::-webkit-slider-thumb]:active:scale-95
                [&::-webkit-slider-thumb]:focus:outline-none
                [&::-webkit-slider-thumb]:focus:ring-2
                [&::-webkit-slider-thumb]:focus:ring-primary/40
                [&::-moz-range-thumb]:w-4
                [&::-moz-range-thumb]:h-4
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-primary
                [&::-moz-range-thumb]:border-0
                [&::-moz-range-thumb]:shadow-md
                [&::-moz-range-thumb]:transition-transform
                [&::-moz-range-thumb]:hover:scale-110
                [&::-moz-range-thumb]:active:scale-95
                [&::-moz-range-thumb]:focus:outline-none
                [&::-moz-range-thumb]:focus:ring-2
                [&::-moz-range-thumb]:focus:ring-primary/40
                [&::-webkit-slider-runnable-track]:h-1.5
                [&::-webkit-slider-runnable-track]:rounded-full
                [&::-webkit-slider-runnable-track]:bg-muted
                [&::-moz-range-track]:h-1.5
                [&::-moz-range-track]:rounded-full
                [&::-moz-range-track]:bg-muted"
              aria-label="Experience rating"
              aria-valuemin={1}
              aria-valuemax={5}
              aria-valuenow={value}
              aria-valuetext={`${value} out of 5 - ${currentLevel.label}`}
            />
          </div>

          <div className="flex justify-between px-0.5 mt-1.5">
            {EXPERIENCE_LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() => setValue(level.value)}
                className={`flex flex-col items-center gap-0.5 transition-opacity text-center ${
                  value === level.value ? "opacity-100" : "opacity-40 hover:opacity-70"
                }`}
                aria-label={`Set rating to ${level.value} - ${level.label}`}
                type="button"
              >
                <span className="text-base leading-none">{level.emoji}</span>
                <span className="text-[11px] sm:text-xs font-medium max-w-[50px] sm:max-w-[60px] leading-tight break-words">
                  {level.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <Button onClick={handleSubmit} disabled={loading} className="w-full h-9 mt-3" size="sm">
          {loading ? "Submitting..." : "Submit Feedback"}
        </Button>

        {aggregate && aggregate.count > 0 && (
          <div className="pt-3 border-t mt-3">
            <p className="text-xs text-muted-foreground text-center mb-2">
              {aggregate.count} {aggregate.count === 1 ? "person has" : "people have"} rated this {listingType}
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="flex gap-1">
                {EXPERIENCE_LEVELS.map((level) => (
                  <span
                    key={level.value}
                    className={`text-base transition-opacity ${
                      level.value <= Math.round(aggregate.avg) ? "opacity-100" : "opacity-20"
                    }`}
                  >
                    {level.emoji}
                  </span>
                ))}
              </div>
              <span className="text-xs font-medium">{aggregate.avg.toFixed(1)} average</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
