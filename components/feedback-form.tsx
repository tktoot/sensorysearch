"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { MessageSquare, CheckCircle2, Loader2 } from "lucide-react"

interface FeedbackFormProps {
  listingId: string
  listingType: "event" | "venue"
  organizerUserId?: string
}

export function FeedbackForm({ listingId, listingType, organizerUserId }: FeedbackFormProps) {
  const [message, setMessage] = useState("")
  const [email, setEmail] = useState("")
  const [allowReply, setAllowReply] = useState(true)
  const [honeypot, setHoneypot] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

  const charCount = message.length
  const maxChars = 500

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (message.trim().length === 0) {
      setError("Please enter a message")
      return
    }

    if (message.length > maxChars) {
      setError(`Message must be ${maxChars} characters or less`)
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          listingType,
          message: message.trim(),
          authorEmail: email.trim() || null,
          allowReply,
          honeypot,
          organizerUserId,
        }),
      })

      if (response.status === 429) {
        setError("You've submitted too many messages. Please try again later.")
        setIsSubmitting(false)
        return
      }

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || "Failed to submit feedback")
        setIsSubmitting(false)
        return
      }

      // Save unsent message to session storage (clear on success)
      sessionStorage.removeItem(`feedback-${listingId}`)

      setIsSubmitted(true)
      console.log("[v0] FEEDBACK_SUBMITTED", { listingId, listingType })
    } catch (err) {
      console.error("[v0] FEEDBACK_SUBMIT_ERROR", err)
      setError("An error occurred. Please try again.")
      setIsSubmitting(false)
    }
  }

  const handleSendAnother = () => {
    setMessage("")
    setEmail("")
    setAllowReply(true)
    setIsSubmitted(false)
    setError("")
  }

  // Save unsent message to session storage
  const handleMessageChange = (value: string) => {
    setMessage(value)
    if (value.trim().length > 0) {
      sessionStorage.setItem(`feedback-${listingId}`, value)
    } else {
      sessionStorage.removeItem(`feedback-${listingId}`)
    }
  }

  // Restore unsent message on mount
  useState(() => {
    const saved = sessionStorage.getItem(`feedback-${listingId}`)
    if (saved) {
      setMessage(saved)
    }
  })

  if (isSubmitted) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Thanks! Your feedback was sent privately.</h3>
            <p className="text-sm text-muted-foreground">
              The SensorySearch team and the organizer will review your message.
            </p>
          </div>
          <Button variant="outline" onClick={handleSendAnother} className="gap-2 bg-transparent">
            <MessageSquare className="h-4 w-4" />
            Send another
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Send Private Feedback
        </CardTitle>
        <CardDescription>
          This message goes to the SensorySearch team and the organizer. It won't be public.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Share your thoughts, suggestions, or concerns..."
              value={message}
              onChange={(e) => handleMessageChange(e.target.value)}
              rows={5}
              className="resize-none"
              disabled={isSubmitting}
            />
            <div className="flex items-center justify-between text-sm">
              <span className={charCount > maxChars ? "text-destructive" : "text-muted-foreground"}>
                {charCount} / {maxChars}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm text-muted-foreground">
              Your email (optional)
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="allowReply"
              checked={allowReply}
              onCheckedChange={(checked) => setAllowReply(checked as boolean)}
              disabled={isSubmitting}
            />
            <Label htmlFor="allowReply" className="text-sm font-normal cursor-pointer">
              Allow organizer to reply
            </Label>
          </div>

          {/* Honeypot field (hidden from users) */}
          <input
            type="text"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            style={{ position: "absolute", left: "-9999px" }}
            tabIndex={-1}
            autoComplete="off"
          />

          {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

          <Button type="submit" disabled={isSubmitting || charCount === 0 || charCount > maxChars} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Feedback"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
