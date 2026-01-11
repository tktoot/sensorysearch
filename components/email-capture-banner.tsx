"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Mail, Check, Loader2 } from "lucide-react"

export function EmailCaptureBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const dismissed = localStorage.getItem("emailBannerDismissed")
    const captured = localStorage.getItem("emailCaptured")

    if (!dismissed && !captured) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem("emailBannerDismissed", "true")
    setIsVisible(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error")
      setMessage("Please enter a valid email address")
      return
    }

    setStatus("loading")
    setMessage("")

    try {
      const response = await fetch("/api/email-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "banner" }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit")
      }

      setStatus("success")
      setMessage("Thanks! We'll keep you updated.")
      localStorage.setItem("emailCaptured", "true")

      setTimeout(() => {
        setIsVisible(false)
      }, 3000)
    } catch (err) {
      setStatus("error")
      setMessage("Something went wrong. Please try again.")
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#5BC0BE] via-[#C8A2C8] to-[#F8E9A1] shadow-lg animate-in slide-in-from-top duration-500">
      <div className="container mx-auto px-3 py-2 md:py-3">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="hidden sm:flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm flex-shrink-0">
              <Mail className="h-4 w-4 md:h-5 md:w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-white leading-tight truncate">
                Get sensory-friendly updates
              </p>
              <p className="hidden sm:block text-xs text-white/80 leading-tight truncate">
                New venues and events in your area
              </p>
            </div>
          </div>

          {status === "success" ? (
            <div className="flex items-center gap-1 md:gap-2 text-white flex-shrink-0">
              <Check className="h-4 w-4 md:h-5 md:w-5" />
              <span className="text-xs md:text-sm font-medium hidden sm:inline">{message}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex items-center gap-1 md:gap-2 flex-shrink-0">
              <Input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-8 md:h-9 w-32 sm:w-48 md:w-64 bg-white/90 border-0 text-xs md:text-sm placeholder:text-muted-foreground"
                disabled={status === "loading"}
              />
              <Button
                type="submit"
                size="sm"
                className="h-8 md:h-9 px-2 md:px-4 bg-white text-primary hover:bg-white/90 font-medium text-xs md:text-sm"
                disabled={status === "loading"}
              >
                {status === "loading" ? (
                  <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" />
                ) : (
                  <span className="hidden sm:inline">Notify Me</span>
                )}
                <span className="sm:hidden">Go</span>
              </Button>
            </form>
          )}

          <button
            onClick={handleDismiss}
            className="rounded-full p-1 text-white/80 hover:text-white hover:bg-white/20 transition-colors flex-shrink-0"
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        </div>

        {status === "error" && message && (
          <p className="mt-1 text-xs text-white/90 text-center animate-in fade-in duration-300">{message}</p>
        )}
      </div>
    </div>
  )
}
