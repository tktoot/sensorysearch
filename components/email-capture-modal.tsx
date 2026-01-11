"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Mail, Loader2 } from "lucide-react"

interface EmailCaptureModalProps {
  isOpen: boolean
  onClose: () => void
  source: "favorites" | "alerts" | "resource_download" | "organizer_submit"
  title: string
  description: string
  onSuccess?: () => void
}

export function EmailCaptureModal({ isOpen, onClose, source, title, description, onSuccess }: EmailCaptureModalProps) {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [zip, setZip] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch("/api/email-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source, zip }),
      })

      if (!response.ok) {
        throw new Error("Failed to save email")
      }

      toast({
        title: "Success!",
        description: "Thank you for signing up!",
      })

      // Store in localStorage to prevent repeated prompts
      const existingEmails = JSON.parse(localStorage.getItem("email_signups") || "[]")
      localStorage.setItem(
        "email_signups",
        JSON.stringify([...existingEmails, { email, source, timestamp: Date.now() }]),
      )

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error("[v0] Email capture error:", error)
      toast({
        title: "Error",
        description: "Failed to save email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="zip">ZIP Code (optional)</Label>
            <Input
              id="zip"
              type="text"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              placeholder="18101"
              maxLength={5}
            />
            <p className="text-xs text-muted-foreground">We'll let you know about new listings near you</p>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent"
              disabled={submitting}
            >
              Not now
            </Button>
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Sign up"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
