"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building2, CheckCircle2, ArrowRight, AlertCircle, Loader2 } from "lucide-react"

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validateNextParam(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/submit"
  }
  return next
}

export default function UpgradeOrganizerPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const nextPath = validateNextParam(searchParams.get("next"))

  const [businessName, setBusinessName] = useState("")
  const [email, setEmail] = useState("")

  const [touched, setTouched] = useState({ businessName: false, email: false })
  const businessNameError = touched.businessName && businessName.trim() === "" ? "Business name is required" : ""
  const emailError =
    touched.email && (email.trim() === "" ? "Email is required" : !isValidEmail(email) ? "Invalid email format" : "")

  const isFormValid = businessName.trim() !== "" && email.trim() !== "" && isValidEmail(email)

  useEffect(() => {
    console.log("[v0] UPGRADE_START - User landed on upgrade page", {
      next: nextPath,
    })
  }, [nextPath])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setTouched({ businessName: true, email: true })

    if (!isFormValid) {
      setError("Please fill in all required fields correctly")
      return
    }

    setError("")
    setLoading(true)

    try {
      console.log("[v0] Calling POST /api/upgrade-organizer", { businessName, email })

      const response = await fetch("/api/upgrade-organizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName, email }),
      })

      const responseText = await response.text()
      let responseData
      try {
        responseData = JSON.parse(responseText)
      } catch {
        console.error("[v0] Server returned non-JSON response:", response.status, responseText)
        setError(`Server error (${response.status}). Please try again.`)
        setLoading(false)
        return
      }

      if (!response.ok) {
        console.error("[v0] UPGRADE_ERROR:", response.status, responseData)
        setError(responseData.error || `Failed to create organizer account (${response.status})`)
        setLoading(false)
        return
      }

      console.log("[v0] UPGRADE_SUCCESS - Redirecting to:", nextPath)

      router.replace(nextPath)
    } catch (err: any) {
      console.error("[v0] UPGRADE_ERROR - Unexpected exception:", err)
      setError(err?.message || "An unexpected error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Become an Organizer</h1>
        <p className="text-lg text-muted-foreground">List your venues and events on CalmSeek</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Organizer Information</CardTitle>
              <CardDescription>Tell us about your organization</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Alert className="bg-primary/5 border-primary/20">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <AlertDescription>
                During beta, organizer accounts are <strong>free</strong>.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="business_name">
                Business Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="business_name"
                placeholder="Your Organization or Business Name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                onBlur={() => setTouched({ ...touched, businessName: true })}
                disabled={loading}
                required
              />
              {businessNameError && <p className="text-sm text-destructive">{businessNameError}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Contact Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@yourorganization.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched({ ...touched, email: true })}
                disabled={loading}
                required
              />
              {emailError && <p className="text-sm text-destructive">{emailError}</p>}
              <p className="text-xs text-muted-foreground">This will be visible to families on your listings</p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading || !isFormValid} className="flex-1 gap-2">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Organizer Account
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/profile")} disabled={loading}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
