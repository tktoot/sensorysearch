"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, CreditCard, ArrowLeft, Info } from "lucide-react"
import { getCurrentUser, hasRole } from "@/lib/auth-utils"
import { createBillingPortalSession } from "@/lib/stripe-actions"
import { BILLING_ENABLED } from "@/lib/config"

export default function BillingManagePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!BILLING_ENABLED) {
      console.log("[v0] BILLING_DISABLED - Showing placeholder page")
      setLoading(false)
      return
    }

    const redirectToBillingPortal = async () => {
      console.log("[v0] BILLING_PORTAL_START - User accessing billing management")

      const currentUser = getCurrentUser()
      console.log("[v0] Current user", { user: currentUser })

      if (!currentUser) {
        console.log("[v0] No user found, redirecting to profile")
        router.push("/profile")
        return
      }

      if (currentUser.role === "admin") {
        setIsAdmin(true)
        console.log("[v0] Admin user detected")
      }

      const isAuthorized = hasRole("organizer")
      console.log("[v0] Authorization check", { isAuthorized })

      if (!isAuthorized) {
        console.log("[v0] BILLING_ACCESS_DENIED - Redirecting to upgrade")
        router.push("/upgrade-organizer")
        return
      }

      const billingCustomerId: string | null = null

      // TODO: Fetch from Supabase organizer_profiles table
      console.log("[v0] TODO: Fetch billing_customer_id from organizer_profiles")

      if (!billingCustomerId) {
        console.error("[v0] BILLING_PORTAL_ERROR - No billing customer ID found")
        setError("No billing account found. Please complete organizer setup first.")
        setLoading(false)
        return
      }

      const result = await createBillingPortalSession(billingCustomerId, window.location.origin + "/organizer-account")

      if (!result.success) {
        console.error("[v0] BILLING_PORTAL_ERROR - Failed to create session", { error: result.error })
        setError(result.error || "Failed to access billing portal")
        setLoading(false)
        return
      }

      console.log("[v0] BILLING_PORTAL_OK - Redirecting to billing portal", { url: result.url })
      window.location.href = result.url
    }

    redirectToBillingPortal()
  }, [router])

  if (!BILLING_ENABLED) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Info className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Subscription Management Unavailable</CardTitle>
                <CardDescription>Payments are turned off in this preview build</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Billing and subscription management features are disabled in this preview. You can still create and save
                ad drafts without payment.
              </AlertDescription>
            </Alert>

            <div className="rounded-lg bg-muted/50 p-4 space-y-3">
              <p className="text-sm font-medium">What you can do:</p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Create venue and event listings (saved as drafts)</li>
                <li>• View your organizer dashboard</li>
                <li>• Preview how your listings will appear</li>
              </ul>
            </div>

            <Button onClick={() => router.push("/organizer-account")} className="w-full gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                To enable billing, set{" "}
                <code className="bg-muted px-1 py-0.5 rounded text-xs">NEXT_PUBLIC_BILLING_ENABLED=true</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card>
          <CardContent className="flex flex-col items-center gap-6 p-12 text-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Opening Billing Portal</h2>
              <p className="text-muted-foreground">Please wait while we redirect you...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <Card className="border-destructive/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-2xl">Unable to Access Billing</CardTitle>
              <CardDescription>We encountered an issue accessing your billing portal</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>

          <div className="rounded-lg bg-muted/50 p-4 space-y-3">
            <p className="text-sm font-medium">What you can try:</p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Go back and try again in a moment</li>
              <li>• Check that your organizer account is fully set up</li>
              <li>• Contact support if the issue persists</li>
            </ul>
          </div>

          {isAdmin && (
            <Alert>
              <CreditCard className="h-4 w-4" />
              <AlertDescription>
                <strong>Admin Notice:</strong> Billing not configured. Check that STRIPE_SECRET_KEY is set in
                environment variables.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button onClick={() => router.push("/organizer-account")} className="flex-1 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Need help?{" "}
              <a href="mailto:contact@sensorysearch.com" className="text-primary hover:underline">
                Contact Support
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
