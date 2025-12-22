"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Building2, CreditCard, CheckCircle2, ArrowRight, ArrowLeft, AlertCircle, Loader2, ChevronDown } from 'lucide-react'
import { PhoneVerification } from "@/components/phone-verification"
import { getCurrentUser, setCurrentUser } from "@/lib/auth-utils"
import { createOrRetrieveCustomer, addPaymentMethod } from "@/lib/stripe-actions"
import { useToast } from "@/hooks/use-toast"
import type { UserProfile } from "@/lib/mock-data"

export default function UpgradeOrganizerPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [debugDetails, setDebugDetails] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)

  const [organizerInfo, setOrganizerInfo] = useState({
    business_name: "",
    business_contact_email: "",
    business_contact_phone: "",
  })

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (currentUser?.role === "admin") {
      setIsAdmin(true)
    }

    if (currentUser?.role === "organizer" || currentUser?.role === "business") {
      router.push("/organizer-account")
    }

    console.log("[v0] UPGRADE_START - User landed on upgrade page", {
      user_id: currentUser?.email,
      route: "/upgrade-organizer",
    })
  }, [router])

  const handleOrganizerInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    console.log("[v0] Step 1 complete - Organizer info submitted", organizerInfo)

    await new Promise((resolve) => setTimeout(resolve, 500))

    setLoading(false)
    setStep(2)
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setDebugDetails("")
    setLoading(true)

    try {
      let currentUser = getCurrentUser()

      if (!currentUser) {
        const savedProfile = localStorage.getItem("userProfile")
        if (savedProfile) {
          const profile: UserProfile = JSON.parse(savedProfile)
          currentUser = {
            email: profile.email,
            role: profile.role || "user",
          }
          setCurrentUser(currentUser)
          console.log("[v0] Created currentUser from userProfile", currentUser)
        }
      }

      if (!currentUser) {
        throw new Error("No user found. Please log in or create a profile first.")
      }

      console.log("[v0] Step 2 - Adding payment method", { user_id: currentUser.email })

      const customerResult = await createOrRetrieveCustomer(currentUser.email, organizerInfo.business_contact_email)

      if (!customerResult.success) {
        setError(customerResult.error || "Failed to create billing account")
        setDebugDetails(`Error: ${customerResult.error}`)
        setLoading(false)
        return
      }

      const paymentResult = await addPaymentMethod(currentUser.email, "pm_test_123")

      if (!paymentResult.success) {
        setError(paymentResult.error || "Failed to add payment method")
        setDebugDetails(`Error: ${paymentResult.error}`)
        setLoading(false)
        return
      }

      console.log("[v0] PM_ADDED - Payment method added successfully")

      const updatedUser = {
        ...currentUser,
        role: "organizer" as const,
      }
      setCurrentUser(updatedUser)

      const savedProfile = localStorage.getItem("userProfile")
      if (savedProfile) {
        const profile: UserProfile = JSON.parse(savedProfile)
        const updatedProfile: UserProfile = {
          ...profile,
          role: "organizer",
          business_verified: true,
          organizer_verified: true,
          has_payment_method_on_file: true,
          business_name: organizerInfo.business_name,
          business_contact_phone: organizerInfo.business_contact_phone,
          phone_number: organizerInfo.business_contact_phone,
          billing_customer_id: customerResult.customerId,
        }
        localStorage.setItem("userProfile", JSON.stringify(updatedProfile))
      }

      console.log("[v0] ROLE_SET_ORGANIZER - User role updated to organizer")
      console.log("[v0] UPGRADE_DONE - Upgrade complete, redirecting to dashboard")

      toast({
        title: "Success!",
        description: "Your organizer account has been created.",
      })

      await new Promise((resolve) => setTimeout(resolve, 500))

      router.push("/organizer-account")
    } catch (err) {
      console.error("[v0] UPGRADE_ERROR - Failed to complete upgrade", err)
      setError("An unexpected error occurred. Please try again.")
      setDebugDetails(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  const progressPercentage = (step / 2) * 100

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Become an Organizer</h1>
        <p className="text-lg text-muted-foreground">List your venues and events on Sensory Search</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Step {step} of 2</span>
          <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}% complete</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Step 1: Organizer Info */}
      {step === 1 && (
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
            <form onSubmit={handleOrganizerInfoSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="business_name">Organization Name *</Label>
                <Input
                  id="business_name"
                  required
                  placeholder="Your Organization or Business Name"
                  value={organizerInfo.business_name}
                  onChange={(e) => setOrganizerInfo({ ...organizerInfo, business_name: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_contact_email">Public Contact Email *</Label>
                <Input
                  id="business_contact_email"
                  type="email"
                  required
                  placeholder="contact@yourorganization.com"
                  value={organizerInfo.business_contact_email}
                  onChange={(e) => setOrganizerInfo({ ...organizerInfo, business_contact_email: e.target.value })}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">This will be visible to families on your listings</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_contact_phone">Contact Phone *</Label>
                <Input
                  id="business_contact_phone"
                  type="tel"
                  required
                  placeholder="(555) 123-4567"
                  value={organizerInfo.business_contact_phone}
                  onChange={(e) => setOrganizerInfo({ ...organizerInfo, business_contact_phone: e.target.value })}
                  disabled={loading}
                />
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
                      Processing...
                    </>
                  ) : (
                    <>
                      Continue
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
      )}

      {/* Step 2: Payment Method */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Add Payment Method</CardTitle>
                <CardDescription>Required for venue subscriptions and event listings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <Alert className="bg-primary/5 border-primary/20">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <AlertDescription>
                  <strong>No charge today!</strong> Your card will only be charged when you submit your first venue or
                  event.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input id="cardNumber" placeholder="1234 5678 9012 3456" required disabled={loading} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input id="expiry" placeholder="MM/YY" required disabled={loading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input id="cvc" placeholder="123" required disabled={loading} />
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-2">
                <p className="font-medium">Pricing:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Venues: $9.99/month per location (recurring)</li>
                  <li>• Events: $9.99 per event or $19.99 for Featured (one-time)</li>
                </ul>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {isAdmin && debugDetails && (
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent">
                      <ChevronDown className="h-4 w-4" />
                      Debug Details (Admin Only)
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <div className="rounded-lg bg-muted p-3 text-xs font-mono">{debugDetails}</div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="flex-1 gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Complete Setup
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setStep(1)} disabled={loading}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Mobile-friendly spacing */}
      <div className="h-8" />
    </div>
  )
}
