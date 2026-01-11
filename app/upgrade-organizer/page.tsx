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
import { upgradeToOrganizer } from "@/lib/profile-helpers"
import { useToast } from "@/hooks/use-toast"

export default function UpgradeOrganizerPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const nextPath = searchParams.get("next") || "/submit"

  const [organizerInfo, setOrganizerInfo] = useState({
    business_name: "",
    business_contact_email: "",
  })

  useEffect(() => {
    console.log("[v0] UPGRADE_START - User landed on upgrade page", {
      next: nextPath,
    })
  }, [nextPath])

  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      console.log("[v0] Upgrading user to organizer", organizerInfo)

      const success = await upgradeToOrganizer()

      if (!success) {
        throw new Error("Failed to upgrade to organizer")
      }

      console.log("[v0] ROLE_SET_ORGANIZER - User role updated to organizer")
      console.log("[v0] UPGRADE_DONE - Upgrade complete, redirecting to:", nextPath)

      toast({
        title: "Success!",
        description: "Your organizer account has been created.",
      })

      window.location.href = nextPath
    } catch (err) {
      console.error("[v0] UPGRADE_ERROR - Failed to complete upgrade", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Become an Organizer</h1>
        <p className="text-lg text-muted-foreground">List your venues and events on SensorySearch</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Organizer Information</CardTitle>
              <CardDescription>Tell us about your organization (optional)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpgrade} className="space-y-4">
            <Alert className="bg-primary/5 border-primary/20">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <AlertDescription>
                During beta, organizer accounts are <strong>free</strong>. You can add details later from your profile.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="business_name">Organization Name (optional)</Label>
              <Input
                id="business_name"
                placeholder="Your Organization or Business Name"
                value={organizerInfo.business_name}
                onChange={(e) => setOrganizerInfo({ ...organizerInfo, business_name: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_contact_email">Public Contact Email (optional)</Label>
              <Input
                id="business_contact_email"
                type="email"
                placeholder="contact@yourorganization.com"
                value={organizerInfo.business_contact_email}
                onChange={(e) => setOrganizerInfo({ ...organizerInfo, business_contact_email: e.target.value })}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">This will be visible to families on your listings</p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1 gap-2">
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
