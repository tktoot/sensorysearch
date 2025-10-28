"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle2,
  MapPin,
  CreditCard,
  ArrowRight,
  Gift,
  AlertCircle,
  Calendar,
  Building2,
  Star,
  Info,
  TreePine,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { PhoneVerification } from "@/components/phone-verification"
import {
  computeEventHashSignature,
  isEligibleForFreeTrial,
  checkRateLimit,
  isEmailDomainWhitelisted,
  type UserProfile,
} from "@/lib/mock-data"
import { getCurrentUser } from "@/lib/auth-utils"
import { BILLING_ENABLED } from "@/lib/config"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

type SubmissionType = "venue" | "event" | null
// Renamed to venueListingType to be more descriptive
type VenueListingType = "business" | "community" | null

export default function AdvertisePage() {
  const router = useRouter()
  const formRef = useRef<HTMLDivElement>(null)
  const benefitsRef = useRef<HTMLDivElement>(null)
  const [submissionType, setSubmissionType] = useState<SubmissionType>(null)
  const [venueListingType, setVenueListingType] = useState<VenueListingType>(null) // Renamed from venueType
  const [step, setStep] = useState<
    "entry" | "choice" | "venue-type" | "form" | "verification" | "checkout" | "success"
  >("entry")
  const [locationCount, setLocationCount] = useState(1)
  const [isFeaturedEvent, setIsFeaturedEvent] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile>({
    agePreference: null,
    role: "business",
    phone_verified_at: null,
    free_trial_used: false,
    billing_payment_method_id: null,
    is_domain_whitelisted: false,
    allow_multiple_trials: false,
  })
  const [isBusinessAccount, setIsBusinessAccount] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const [formData, setFormData] = useState({
    businessName: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    // Added contactWebsite field
    contactWebsite: "",
    eventTitle: "",
    eventDescription: "",
    venueAddress: "",
    // Added venueCity field
    venueCity: "",
    eventDate: "",
    eventTime: "",
    isRecurring: false,
    recurringPattern: "",
    category: "",
    sensoryFeatures: [] as string[],
    billingName: "",
    billingEmail: "",
    billingPhone: "",
    saveCard: true,
    venuePhotos: [] as string[],
  })

  const basePrice = submissionType === "venue" ? 9.99 : isFeaturedEvent ? 19.99 : 9.99
  const additionalLocationPrice = 2.99
  const isFreeTrial = isEligibleForFreeTrial(userProfile)
  const totalMonthly =
    submissionType === "venue"
      ? isFreeTrial
        ? 0
        : basePrice + (locationCount - 1) * additionalLocationPrice
      : isFreeTrial
        ? 0
        : basePrice

  const categories = [
    "Restaurant",
    "Museum",
    "Music School",
    "Therapy Center",
    "Park",
    "Library",
    "Entertainment",
    "Other",
  ]

  const sensoryFeatures = [
    "Quiet Space Available",
    "Adjustable Lighting",
    "Staff Training",
    "OT Present",
    "Reduced Capacity",
    "Noise-Canceling Options",
    "Sensory-Friendly Hours",
    "Wheelchair Accessible",
  ]

  useEffect(() => {
    const checkOrganizerStatus = async () => {
      const user = await getCurrentUser()
      if (user && (user.role === "organizer" || user.role === "admin")) {
        router.push("/submit")
      }
    }
    checkOrganizerStatus()
  }, [router])

  useEffect(() => {
    const currentUser = getCurrentUser()
    const savedProfile = localStorage.getItem("userProfile")

    if (savedProfile) {
      const profile: UserProfile = JSON.parse(savedProfile)
      setUserProfile(profile)
      setIsBusinessAccount(profile.role === "business")
    } else if (currentUser) {
      setIsBusinessAccount(currentUser.role === "business")
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (formData.contactEmail) {
      const isWhitelisted = isEmailDomainWhitelisted(formData.contactEmail)
      setUserProfile((prev) => ({
        ...prev,
        email: formData.contactEmail,
        email_domain: formData.contactEmail.split("@")[1],
        is_domain_whitelisted: isWhitelisted,
      }))
    }
  }, [formData.contactEmail])

  if (!isLoading && !isBusinessAccount && step !== "entry") {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="mx-auto max-w-2xl border-primary/20">
          <CardContent className="flex flex-col items-center gap-6 p-12 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <AlertCircle className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-foreground">Organizer Account Required</h2>
              <p className="text-lg text-muted-foreground">
                You need an organizer account to submit paid events and venues. Upgrade your account to get started.
              </p>
            </div>
            <Button asChild size="lg" className="gap-2">
              <a href="/profile">
                <ArrowRight className="h-5 w-5" />
                Upgrade to Organizer Account
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const scrollToBenefits = () => {
    benefitsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!BILLING_ENABLED) {
      if (submissionType === "venue" && venueListingType === "community") {
        // Community venues always free, proceed to success
        console.log("[v0] BILLING_DISABLED - Community venue, proceeding to success")
        handleSaveDraft() // Still save the community venue
        setStep("success")
        window.scrollTo({ top: 0, behavior: "smooth" })
        return
      } else {
        // Paid submissions: show modal and save as pending
        console.log("[v0] BILLING_DISABLED - Showing payment coming soon modal")
        setShowPaymentModal(true)
        return
      }
    }

    // Existing logic for when BILLING_ENABLED is true
    const rateLimitCheck = checkRateLimit(userProfile)
    if (!rateLimitCheck.allowed) {
      alert(rateLimitCheck.message)
      return
    }

    const eventHash = computeEventHashSignature(
      formData.venueAddress,
      `${formData.eventDate} ${formData.eventTime}`,
      formData.eventTitle,
    )

    console.log("[v0] Event hash signature:", eventHash)

    // This block is only relevant when BILLING_ENABLED is true and we are not handling the community venue case above
    if (!BILLING_ENABLED) {
      console.log("[v0] BILLING_DISABLED - Saving submission as draft")
      handleSaveDraft()
      return
    }

    if (
      !userProfile.phone_verified_at ||
      (!userProfile.billing_payment_method_id && !userProfile.is_domain_whitelisted)
    ) {
      setStep("verification")
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      setStep("checkout")
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleSaveDraft = () => {
    console.log("[v0] DRAFT_SAVE_START - Saving submission as draft")

    const draft = {
      id: `draft_${Date.now()}`,
      type: submissionType,
      status: "pending_billing", // This status might need adjustment based on billing enablement
      businessName: formData.businessName,
      contactName: formData.contactName,
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
      eventTitle: formData.eventTitle,
      eventDescription: formData.eventDescription,
      venueAddress: formData.venueAddress,
      eventDate: formData.eventDate,
      eventTime: formData.eventTime,
      isRecurring: formData.isRecurring,
      recurringPattern: formData.recurringPattern,
      category: formData.category,
      sensoryFeatures: formData.sensoryFeatures,
      isFeatured: isFeaturedEvent,
      createdAt: new Date().toISOString(),
    }

    const existingDrafts = JSON.parse(localStorage.getItem("submissionDrafts") || "[]")
    localStorage.setItem("submissionDrafts", JSON.stringify([...existingDrafts, draft]))

    console.log("[v0] DRAFT_SAVED - Draft saved successfully", { draftId: draft.id })
    // Success step is handled by the caller of handleSaveDraft now.
  }

  const handleSaveCommunityVenue = () => {
    console.log("[v0] COMMUNITY_VENUE_SUBMIT - Saving free community venue listing")

    const communityVenue = {
      id: `community_${Date.now()}`,
      type: "venue",
      listingType: "community",
      status: "pending_approval",
      venueName: formData.businessName,
      contactName: formData.contactName,
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
      contactWebsite: formData.contactWebsite,
      venueAddress: formData.venueAddress,
      venueCity: formData.venueCity,
      description: formData.eventDescription,
      category: formData.category,
      sensoryFeatures: formData.sensoryFeatures,
      photos: formData.venuePhotos,
      createdAt: new Date().toISOString(),
    }

    const existingSubmissions = JSON.parse(localStorage.getItem("communityVenueSubmissions") || "[]")
    localStorage.setItem("communityVenueSubmissions", JSON.stringify([...existingSubmissions, communityVenue]))

    console.log("[v0] COMMUNITY_VENUE_SAVED - Community venue saved successfully", { venueId: communityVenue.id })
    // Success step is handled by the caller of handleSaveCommunityVenue now.
  }

  const handlePhoneVerified = (phoneNumber: string) => {
    setUserProfile((prev) => ({
      ...prev,
      phone_number: phoneNumber,
      phone_verified_at: new Date().toISOString(),
    }))
  }

  const handleCardAdded = () => {
    setUserProfile((prev) => ({
      ...prev,
      billing_payment_method_id: `pm_${Date.now()}`,
    }))
  }

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault()

    if (isFreeTrial) {
      setUserProfile((prev) => ({
        ...prev,
        free_trial_used: true,
      }))
    }

    const now = new Date()
    const lastSubmission = userProfile.last_submission_time ? new Date(userProfile.last_submission_time) : null
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000)

    let submissionCount = 1
    if (lastSubmission && lastSubmission > hourAgo) {
      submissionCount = (userProfile.submission_count_last_hour || 0) + 1
    }

    setUserProfile((prev) => ({
      ...prev,
      submission_count_last_hour: submissionCount,
      last_submission_time: now.toISOString(),
    }))

    const subscription = {
      id: `sub_${Date.now()}`,
      businessName: formData.businessName,
      email: formData.billingEmail,
      tier: "basic" as const,
      monthlyPrice: totalMonthly,
      status: "active" as const,
      startDate: new Date().toISOString(),
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      paymentMethod: "card",
      isFreeTrial: isFreeTrial,
      phoneVerified: !!userProfile.phone_verified_at,
      phoneNumber: userProfile.phone_number,
    }

    const existingSubscriptions = JSON.parse(localStorage.getItem("subscriptions") || "[]")
    localStorage.setItem("subscriptions", JSON.stringify([...existingSubscriptions, subscription]))

    setStep("success")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handlePaymentModalConfirm = () => {
    console.log("[v0] BILLING_DISABLED - Saving submission as pending")
    // This is a generic save draft for now. Depending on the type, we might want specific handlers.
    if (submissionType === "venue" && venueListingType === "community") {
      handleSaveCommunityVenue()
    } else {
      handleSaveDraft()
    }
    setShowPaymentModal(false)
    setStep("success")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (step === "entry") {
    return (
      <div className="container mx-auto px-4 py-8">
        {!BILLING_ENABLED && (
          <Alert className="mb-6 border-primary/20 bg-primary/5">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Beta Mode:</strong> Billing is disabled during beta testing. Listing is free for selected
              partners. Your submissions will be saved as pending for review.
            </AlertDescription>
          </Alert>
        )}

        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <Badge className="mb-4" variant="secondary">
              For Organizers
            </Badge>
            <h1 className="mb-4 text-5xl font-bold tracking-tight text-gradient">List Your Event or Venue</h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground text-pretty">
              Choose the type of listing that best fits your needs
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Event Option - Paid */}
            <Card
              className="group cursor-pointer border-2 transition-all hover:border-primary hover:shadow-lg relative"
              onClick={() => {
                setSubmissionType("event")
                // Adjusted to go directly to form as venue-type is removed
                setStep("form")
                window.scrollTo({ top: 0, behavior: "smooth" })
              }}
            >
              <div className="absolute top-4 right-4">
                <Badge variant="default" className="bg-primary">
                  Paid
                </Badge>
              </div>
              <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">List an Event</h2>
                  <p className="text-sm text-muted-foreground">One-time purchase per event</p>
                </div>
                <ul className="space-y-2 text-left text-sm text-muted-foreground w-full">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Displayed until event date</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Perfect for workshops, classes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>$9.99 per event</span>
                  </li>
                </ul>
                <Button size="lg" className="w-full gap-2 mt-2">
                  Choose Event
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </CardContent>
            </Card>

            {/* Business Venue Option - Paid */}
            <Card
              className="group cursor-pointer border-2 transition-all hover:border-primary hover:shadow-lg relative"
              onClick={() => {
                setSubmissionType("venue")
                setVenueListingType("business") // Use the renamed state variable
                // Adjusted to go directly to form as venue-type is removed
                setStep("form")
                window.scrollTo({ top: 0, behavior: "smooth" })
              }}
            >
              <div className="absolute top-4 right-4">
                <Badge variant="default" className="bg-primary">
                  Paid
                </Badge>
              </div>
              <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">Business Venue</h2>
                  <p className="text-sm text-muted-foreground">Monthly subscription</p>
                </div>
                <ul className="space-y-2 text-left text-sm text-muted-foreground w-full">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Always visible in search</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>For cafes, museums, businesses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>$9.99/month</span>
                  </li>
                </ul>
                <Button size="lg" className="w-full gap-2 mt-2">
                  Choose Business
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </CardContent>
            </Card>

            {/* Community Venue Option - Free */}
            <Card
              className="group cursor-pointer border-2 border-green-200 transition-all hover:border-green-400 hover:shadow-lg relative bg-green-50/50"
              onClick={() => {
                setSubmissionType("venue")
                setVenueListingType("community") // Use the renamed state variable
                setStep("form")
                window.scrollTo({ top: 0, behavior: "smooth" })
              }}
            >
              <div className="absolute top-4 right-4">
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                  Free
                </Badge>
              </div>
              <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 transition-colors group-hover:bg-green-200">
                  <TreePine className="h-8 w-8 text-green-600" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">Community Venue</h2>
                  <p className="text-sm text-muted-foreground">Parks & Playgrounds</p>
                </div>
                <ul className="space-y-2 text-left text-sm text-muted-foreground w-full">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>100% free listing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>For parks, playgrounds, trails</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>No account required</span>
                  </li>
                </ul>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full gap-2 mt-2 border-green-200 hover:bg-green-100 bg-transparent"
                >
                  List for Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              All listings are reviewed by our team to ensure quality and accuracy
            </p>
          </div>
        </div>
      </div>
    )
  }

  // The venue-type step is also removed since we now select venue type in the entry screen
  if (step === "choice") {
    // This step is now redundant due to the new "entry" step.
    // It's kept here to avoid breaking the original structure, but should ideally be removed.
    return null // Or navigate to entry or handle appropriately
  }

  if (step === "venue-type") {
    // This step is now redundant due to the new "entry" step.
    // It's kept here to avoid breaking the original structure, but should ideally be removed.
    return null // Or navigate to entry or handle appropriately
  }

  if (step === "verification") {
    if (!BILLING_ENABLED) {
      console.log("[v0] BILLING_DISABLED - Skipping verification, proceeding to checkout")
      setStep("checkout")
      return null
    }

    const needsPhone = !userProfile.phone_verified_at
    const needsCard = !userProfile.billing_payment_method_id && !userProfile.is_domain_whitelisted
    const canProceed =
      userProfile.phone_verified_at && (userProfile.billing_payment_method_id || userProfile.is_domain_whitelisted)

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <Badge className="mb-4" variant="secondary">
              <Gift className="mr-1 h-3 w-3" />
              First {submissionType === "venue" ? "Venue" : "Event"} Free
            </Badge>
            <h1 className="mb-2 text-4xl font-bold tracking-tight text-foreground">Verification Required</h1>
            <p className="text-lg text-muted-foreground">
              Complete these steps to claim your free first {submissionType}
            </p>
          </div>

          <div className="space-y-6">
            {needsPhone ? (
              <PhoneVerification onVerified={handlePhoneVerified} initialPhone={formData.contactPhone} />
            ) : (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="flex items-center gap-3 p-4">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium">Phone Verified</p>
                    <p className="text-sm text-muted-foreground">{userProfile.phone_number}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {userProfile.is_domain_whitelisted ? (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="flex items-center gap-3 p-4">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium">Whitelisted Organization</p>
                    <p className="text-sm text-muted-foreground">
                      Your domain ({userProfile.email_domain}) is pre-approved
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : needsCard ? (
              <Card className="border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Add Card on File</CardTitle>
                      <CardDescription>Required for future billing (not charged now)</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input id="expiry" placeholder="MM/YY" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input id="cvc" placeholder="123" />
                    </div>
                  </div>

                  <Button onClick={handleCardAdded} className="w-full">
                    Save Card
                  </Button>

                  <p className="text-xs text-muted-foreground">
                    Your card will not be charged for your first {submissionType}. Regular pricing applies after your
                    free trial.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="flex items-center gap-3 p-4">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium">Card on File</p>
                    <p className="text-sm text-muted-foreground">
                      •••• {userProfile.billing_payment_method_id?.slice(-4)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {canProceed && (
              <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-transparent">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <Gift className="h-6 w-6 text-primary" />
                    <div>
                      <h3 className="mb-1 font-semibold">You're eligible for a free first {submissionType}!</h3>
                      <p className="text-sm text-muted-foreground">
                        Your first {submissionType} submission will be free. After that, regular pricing of $9.99/month
                        + $2.99 per additional location applies.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-3">
              <Button onClick={() => setStep("checkout")} disabled={!canProceed} size="lg" className="flex-1 gap-2">
                Continue to Checkout
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => setStep("form")}>
                Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === "success") {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="mx-auto max-w-2xl border-primary/20">
          <CardContent className="flex flex-col items-center gap-6 p-12 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-foreground">
                {!BILLING_ENABLED
                  ? `Your draft has been saved!`
                  : `Thanks! Your ${submissionType} is submitted for review.`}
              </h2>
              <p className="text-lg text-muted-foreground">
                {!BILLING_ENABLED
                  ? "Payments are disabled in this preview build. Your submission has been saved as a draft."
                  : "We'll review your submission and get back to you within 2-3 business days."}
              </p>
            </div>
            {!BILLING_ENABLED && (
              <Badge variant="secondary" className="gap-1">
                <Info className="h-3 w-3" />
                Draft Mode - Billing Disabled
              </Badge>
            )}
            {isFreeTrial && BILLING_ENABLED && (
              <Badge className="gap-1" variant="secondary">
                <Gift className="h-3 w-3" />
                First {submissionType === "venue" ? "Venue" : "Event"} Free Applied
              </Badge>
            )}
            {BILLING_ENABLED && (
              <div className="w-full space-y-3 rounded-lg bg-muted/50 p-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Monthly Cost</span>
                  <span className="font-semibold text-foreground">
                    {isFreeTrial ? (
                      <span className="flex items-center gap-2">
                        <span className="text-muted-foreground line-through">${basePrice.toFixed(2)}</span>
                        <span className="text-primary">$0.00</span>
                      </span>
                    ) : (
                      `$${totalMonthly.toFixed(2)}/month`
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Locations</span>
                  <span className="font-semibold text-foreground">{locationCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Next Billing Date</span>
                  <span className="font-semibold text-foreground">
                    {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {isFreeTrial && (
                  <p className="border-t border-border pt-3 text-xs text-muted-foreground">
                    After your free trial, regular pricing of ${basePrice.toFixed(2)}/month + $
                    {additionalLocationPrice.toFixed(2)} per additional location will apply.
                  </p>
                )}
              </div>
            )}
            <div className="flex gap-3">
              <Button onClick={() => router.push("/organizer-account")}>
                {!BILLING_ENABLED ? "Back to Dashboard" : "View Dashboard"}
              </Button>
              {!BILLING_ENABLED && (
                <Button variant="outline" onClick={() => router.push("/organizer-account")}>
                  View Draft
                </Button>
              )}
              {BILLING_ENABLED && (
                <Button
                  variant="outline"
                  onClick={() => {
                    // Resetting to choice is no longer relevant as it's removed
                    setStep("entry") // Go back to entry screen
                    setSubmissionType(null)
                    setVenueListingType(null) // Reset venue type
                    setFormData({
                      businessName: "", // Clear form data for new submission
                      contactName: "",
                      contactEmail: "",
                      contactPhone: "",
                      contactWebsite: "",
                      eventTitle: "",
                      eventDescription: "",
                      venueAddress: "",
                      venueCity: "",
                      eventDate: "",
                      eventTime: "",
                      isRecurring: false,
                      recurringPattern: "",
                      category: "",
                      sensoryFeatures: [],
                      billingName: "",
                      billingEmail: "",
                      billingPhone: "",
                      saveCard: true,
                      venuePhotos: [],
                    })
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }}
                >
                  Add Another {submissionType === "venue" ? "Venue" : "Event"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // The success step is duplicated in the original code. This is the first occurrence.
  if (step === "success") {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="mx-auto max-w-2xl border-primary/20">
          <CardContent className="flex flex-col items-center gap-6 p-12 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-foreground">
                {!BILLING_ENABLED
                  ? `Your draft has been saved!`
                  : `Thanks! Your ${submissionType} is submitted for review.`}
              </h2>
              <p className="text-lg text-muted-foreground">
                {!BILLING_ENABLED
                  ? "Payments are disabled in this preview build. Your submission has been saved as a draft."
                  : "We'll review your submission and get back to you within 2-3 business days."}
              </p>
            </div>
            {!BILLING_ENABLED && (
              <Badge variant="secondary" className="gap-1">
                <Info className="h-3 w-3" />
                Draft Mode - Billing Disabled
              </Badge>
            )}
            {isFreeTrial && BILLING_ENABLED && (
              <Badge className="gap-1" variant="secondary">
                <Gift className="h-3 w-3" />
                First {submissionType === "venue" ? "Venue" : "Event"} Free Applied
              </Badge>
            )}
            {BILLING_ENABLED && (
              <div className="w-full space-y-3 rounded-lg bg-muted/50 p-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Monthly Cost</span>
                  <span className="font-semibold text-foreground">
                    {isFreeTrial ? (
                      <span className="flex items-center gap-2">
                        <span className="text-muted-foreground line-through">${basePrice.toFixed(2)}</span>
                        <span className="text-primary">$0.00</span>
                      </span>
                    ) : (
                      `$${totalMonthly.toFixed(2)}/month`
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Locations</span>
                  <span className="font-semibold text-foreground">{locationCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Next Billing Date</span>
                  <span className="font-semibold text-foreground">
                    {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {isFreeTrial && (
                  <p className="border-t border-border pt-3 text-xs text-muted-foreground">
                    After your free trial, regular pricing of ${basePrice.toFixed(2)}/month + $
                    {additionalLocationPrice.toFixed(2)} per additional location will apply.
                  </p>
                )}
              </div>
            )}
            <div className="flex gap-3">
              <Button onClick={() => router.push("/organizer-account")}>
                {!BILLING_ENABLED ? "Back to Dashboard" : "View Dashboard"}
              </Button>
              {!BILLING_ENABLED && (
                <Button variant="outline" onClick={() => router.push("/organizer-account")}>
                  View Draft
                </Button>
              )}
              {BILLING_ENABLED && (
                <Button
                  variant="outline"
                  onClick={() => {
                    // Resetting to choice is no longer relevant as it's removed
                    setStep("entry") // Go back to entry screen
                    setSubmissionType(null)
                    setVenueListingType(null) // Reset venue type
                    setFormData({
                      businessName: "", // Clear form data for new submission
                      contactName: "",
                      contactEmail: "",
                      contactPhone: "",
                      contactWebsite: "",
                      eventTitle: "",
                      eventDescription: "",
                      venueAddress: "",
                      venueCity: "",
                      eventDate: "",
                      eventTime: "",
                      isRecurring: false,
                      recurringPattern: "",
                      category: "",
                      sensoryFeatures: [],
                      billingName: "",
                      billingEmail: "",
                      billingPhone: "",
                      saveCard: true,
                      venuePhotos: [],
                    })
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }}
                >
                  Add Another {submissionType === "venue" ? "Venue" : "Event"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // The success step is duplicated in the original code. This is the second occurrence.
  if (step === "success") {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="mx-auto max-w-2xl border-primary/20">
          <CardContent className="flex flex-col items-center gap-6 p-12 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-foreground">
                {!BILLING_ENABLED
                  ? `Your draft has been saved!`
                  : `Thanks! Your ${submissionType} is submitted for review.`}
              </h2>
              <p className="text-lg text-muted-foreground">
                {!BILLING_ENABLED
                  ? "Payments are disabled in this preview build. Your submission has been saved as a draft."
                  : "We'll review your submission and get back to you within 2-3 business days."}
              </p>
            </div>
            {!BILLING_ENABLED && (
              <Badge variant="secondary" className="gap-1">
                <Info className="h-3 w-3" />
                Draft Mode - Billing Disabled
              </Badge>
            )}
            {isFreeTrial && BILLING_ENABLED && (
              <Badge className="gap-1" variant="secondary">
                <Gift className="h-3 w-3" />
                First {submissionType === "venue" ? "Venue" : "Event"} Free Applied
              </Badge>
            )}
            {BILLING_ENABLED && (
              <div className="w-full space-y-3 rounded-lg bg-muted/50 p-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Monthly Cost</span>
                  <span className="font-semibold text-foreground">
                    {isFreeTrial ? (
                      <span className="flex items-center gap-2">
                        <span className="text-muted-foreground line-through">${basePrice.toFixed(2)}</span>
                        <span className="text-primary">$0.00</span>
                      </span>
                    ) : (
                      `$${totalMonthly.toFixed(2)}/month`
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Locations</span>
                  <span className="font-semibold text-foreground">{locationCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Next Billing Date</span>
                  <span className="font-semibold text-foreground">
                    {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {isFreeTrial && (
                  <p className="border-t border-border pt-3 text-xs text-muted-foreground">
                    After your free trial, regular pricing of ${basePrice.toFixed(2)}/month + $
                    {additionalLocationPrice.toFixed(2)} per additional location will apply.
                  </p>
                )}
              </div>
            )}
            <div className="flex gap-3">
              <Button onClick={() => router.push("/organizer-account")}>
                {!BILLING_ENABLED ? "Back to Dashboard" : "View Dashboard"}
              </Button>
              {!BILLING_ENABLED && (
                <Button variant="outline" onClick={() => router.push("/organizer-account")}>
                  View Draft
                </Button>
              )}
              {BILLING_ENABLED && (
                <Button
                  variant="outline"
                  onClick={() => {
                    // Resetting to choice is no longer relevant as it's removed
                    setStep("entry") // Go back to entry screen
                    setSubmissionType(null)
                    setVenueListingType(null) // Reset venue type
                    setFormData({
                      businessName: "", // Clear form data for new submission
                      contactName: "",
                      contactEmail: "",
                      contactPhone: "",
                      contactWebsite: "",
                      eventTitle: "",
                      eventDescription: "",
                      venueAddress: "",
                      venueCity: "",
                      eventDate: "",
                      eventTime: "",
                      isRecurring: false,
                      recurringPattern: "",
                      category: "",
                      sensoryFeatures: [],
                      billingName: "",
                      billingEmail: "",
                      billingPhone: "",
                      saveCard: true,
                      venuePhotos: [],
                    })
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }}
                >
                  Add Another {submissionType === "venue" ? "Venue" : "Event"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // The success step is duplicated in the original code. This is the second occurrence.
  if (step === "success") {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="mx-auto max-w-2xl border-primary/20">
          <CardContent className="flex flex-col items-center gap-6 p-12 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-foreground">
                {!BILLING_ENABLED
                  ? `Your draft has been saved!`
                  : `Thanks! Your ${submissionType} is submitted for review.`}
              </h2>
              <p className="text-lg text-muted-foreground">
                {!BILLING_ENABLED
                  ? "Payments are disabled in this preview build. Your submission has been saved as a draft."
                  : "We'll review your submission and get back to you within 2-3 business days."}
              </p>
            </div>
            {!BILLING_ENABLED && (
              <Badge variant="secondary" className="gap-1">
                <Info className="h-3 w-3" />
                Draft Mode - Billing Disabled
              </Badge>
            )}
            {isFreeTrial && BILLING_ENABLED && (
              <Badge className="gap-1" variant="secondary">
                <Gift className="h-3 w-3" />
                First {submissionType === "venue" ? "Venue" : "Event"} Free Applied
              </Badge>
            )}
            {BILLING_ENABLED && (
              <div className="w-full space-y-3 rounded-lg bg-muted/50 p-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Monthly Cost</span>
                  <span className="font-semibold text-foreground">
                    {isFreeTrial ? (
                      <span className="flex items-center gap-2">
                        <span className="text-muted-foreground line-through">${basePrice.toFixed(2)}</span>
                        <span className="text-primary">$0.00</span>
                      </span>
                    ) : (
                      `$${totalMonthly.toFixed(2)}/month`
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Locations</span>
                  <span className="font-semibold text-foreground">{locationCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Next Billing Date</span>
                  <span className="font-semibold text-foreground">
                    {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {isFreeTrial && (
                  <p className="border-t border-border pt-3 text-xs text-muted-foreground">
                    After your free trial, regular pricing of ${basePrice.toFixed(2)}/month + $
                    {additionalLocationPrice.toFixed(2)} per additional location will apply.
                  </p>
                )}
              </div>
            )}
            <div className="flex gap-3">
              <Button onClick={() => router.push("/organizer-account")}>
                {!BILLING_ENABLED ? "Back to Dashboard" : "View Dashboard"}
              </Button>
              {!BILLING_ENABLED && (
                <Button variant="outline" onClick={() => router.push("/organizer-account")}>
                  View Draft
                </Button>
              )}
              {BILLING_ENABLED && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep("entry") // Go back to entry screen
                    setSubmissionType(null)
                    setVenueListingType(null) // Reset venue type
                    setFormData({
                      businessName: "", // Clear form data for new submission
                      contactName: "",
                      contactEmail: "",
                      contactPhone: "",
                      contactWebsite: "",
                      eventTitle: "",
                      eventDescription: "",
                      venueAddress: "",
                      venueCity: "",
                      eventDate: "",
                      eventTime: "",
                      isRecurring: false,
                      recurringPattern: "",
                      category: "",
                      sensoryFeatures: [],
                      billingName: "",
                      billingEmail: "",
                      billingPhone: "",
                      saveCard: true,
                      venuePhotos: [],
                    })
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }}
                >
                  Add Another {submissionType === "venue" ? "Venue" : "Event"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === "checkout") {
    if (!BILLING_ENABLED) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-2xl">
            <Alert className="mb-6 border-primary/20 bg-primary/5">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Beta Mode:</strong> Payments are disabled. Your submission will be saved as pending for admin
                review.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Review Your Submission</CardTitle>
                <CardDescription>
                  Your {submissionType === "venue" ? "venue" : "event"} will be saved as pending
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                  <p className="font-medium">{formData.businessName || formData.eventTitle}</p>
                  <p className="text-sm text-muted-foreground">{formData.contactEmail}</p>
                  {submissionType === "venue" && venueListingType === "community" && (
                    <Badge variant="secondary" className="gap-1">
                      <MapPin className="h-3 w-3" />
                      Community Venue (Free)
                    </Badge>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button onClick={handlePaymentModalConfirm} size="lg" className="flex-1 gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Submit for Review
                  </Button>
                  <Button type="button" variant="outline" size="lg" onClick={() => setStep("form")}>
                    Back
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="mb-2 text-4xl font-bold tracking-tight text-foreground">
              Complete Your {submissionType === "venue" ? "Subscription" : "Purchase"}
            </h1>
            <p className="text-lg text-muted-foreground">
              {submissionType === "venue"
                ? "Finalize payment and start reaching families"
                : "One-time payment for your event listing"}
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <form onSubmit={handlePayment} className="space-y-6">
                {isFreeTrial && (
                  <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-transparent">
                    <CardContent className="flex items-center gap-3 p-6">
                      <Gift className="h-8 w-8 text-primary" />
                      <div>
                        <h3 className="mb-1 font-semibold text-lg">
                          First {submissionType === "venue" ? "Venue" : "Event"} Free!
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Your first {submissionType} is on us. You won't be charged until your next submission.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!isFreeTrial && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Method</CardTitle>
                      <CardDescription>Select how you'd like to pay</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4">
                        <div className="flex items-center gap-3 rounded-lg border-2 border-primary bg-primary/5 p-4">
                          <input
                            type="radio"
                            id="stripe"
                            name="payment"
                            defaultChecked
                            className="h-4 w-4 text-primary"
                          />
                          <Label htmlFor="stripe" className="flex flex-1 cursor-pointer items-center gap-3">
                            <CreditCard className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium">Credit/Debit Card</p>
                              <p className="text-sm text-muted-foreground">Powered by Stripe</p>
                            </div>
                          </Label>
                        </div>

                        <div className="flex items-center gap-3 rounded-lg border-2 border-border p-4">
                          <input type="radio" id="paypal" name="payment" className="h-4 w-4" />
                          <Label htmlFor="paypal" className="flex flex-1 cursor-pointer items-center gap-3">
                            <div className="flex h-5 w-5 items-center justify-center rounded bg-[#0070ba] text-xs font-bold text-white">
                              P
                            </div>
                            <div>
                              <p className="font-medium">PayPal</p>
                              <p className="text-sm text-muted-foreground">Pay with your PayPal account</p>
                            </div>
                          </Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {userProfile.billing_payment_method_id && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Payment Method on File</CardTitle>
                      <CardDescription>Your saved payment method will be used</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3 rounded-lg border-2 border-primary bg-primary/5 p-4">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">
                            Card ending in {userProfile.billing_payment_method_id.slice(-4)}
                          </p>
                          <p className="text-sm text-muted-foreground">Verified and ready to use</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!userProfile.billing_payment_method_id && !isFreeTrial && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Card Information</CardTitle>
                      <CardDescription>Enter your payment details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input id="cardNumber" placeholder="1234 5678 9012 3456" required />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input id="expiry" placeholder="MM/YY" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvc">CVC</Label>
                          <Input id="cvc" placeholder="123" required />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cardName">Cardholder Name</Label>
                        <Input id="cardName" placeholder="Name on card" required />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="saveCard"
                          checked={formData.saveCard}
                          onCheckedChange={(checked) => setFormData({ ...formData, saveCard: checked as boolean })}
                        />
                        <Label htmlFor="saveCard" className="cursor-pointer font-normal text-sm">
                          Save card for recurring billing
                        </Label>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Billing Information</CardTitle>
                    <CardDescription>For invoices and receipts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="billingName">Full Name</Label>
                      <Input
                        id="billingName"
                        required
                        value={formData.billingName}
                        onChange={(e) => setFormData({ ...formData, billingName: e.target.value })}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="billingEmail">Email</Label>
                        <Input
                          id="billingEmail"
                          type="email"
                          required
                          value={formData.billingEmail}
                          onChange={(e) => setFormData({ ...formData, billingEmail: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="billingPhone">Phone</Label>
                        <Input
                          id="billingPhone"
                          type="tel"
                          required
                          value={formData.billingPhone}
                          onChange={(e) => setFormData({ ...formData, billingPhone: e.target.value })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-3">
                  <Button type="submit" size="lg" className="flex-1 gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    {isFreeTrial
                      ? `Submit Free ${submissionType === "venue" ? "Venue" : "Event"}`
                      : submissionType === "venue"
                        ? `Subscribe & Submit Venue`
                        : `Purchase & Submit Event`}
                  </Button>
                  <Button type="button" variant="outline" size="lg" onClick={() => setStep("verification")}>
                    Back
                  </Button>
                </div>
              </form>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isFreeTrial ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">
                          First {submissionType === "venue" ? "Venue" : "Event"}
                        </span>
                        <Badge variant="secondary" className="gap-1">
                          <Gift className="h-3 w-3" />
                          FREE
                        </Badge>
                      </div>
                      <div className="rounded-lg bg-primary/10 p-4">
                        <p className="mb-2 text-sm font-medium text-primary">After your free trial:</p>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          {submissionType === "venue" ? (
                            <>
                              <div className="flex justify-between">
                                <span>Base (1 location)</span>
                                <span>${basePrice.toFixed(2)}/mo</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Each additional</span>
                                <span>${additionalLocationPrice.toFixed(2)}/mo</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex justify-between">
                                <span>Basic Event</span>
                                <span>$9.99 per event</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Featured Event</span>
                                <span>$19.99 per event</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {submissionType === "venue" ? (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Base (1 location)</span>
                            <span className="font-medium">$9.99/mo</span>
                          </div>
                          {locationCount > 1 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Additional locations ({locationCount - 1})</span>
                              <span className="font-medium">
                                ${((locationCount - 1) * additionalLocationPrice).toFixed(2)}/mo
                              </span>
                            </div>
                          )}
                          <div className="border-t border-border pt-3">
                            <div className="flex justify-between">
                              <span className="font-semibold">Total per month</span>
                              <span className="text-2xl font-bold text-primary">${totalMonthly.toFixed(2)}</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              {isFeaturedEvent ? "Featured Event" : "Basic Event"}
                            </span>
                            <span className="font-medium">${basePrice.toFixed(2)}</span>
                          </div>
                          {isFeaturedEvent && (
                            <div className="rounded-lg bg-amber-500/10 p-3 text-sm">
                              <div className="flex items-center gap-2 mb-1">
                                <Star className="h-4 w-4 text-amber-500" />
                                <span className="font-semibold text-amber-700">Featured Benefits</span>
                              </div>
                              <ul className="space-y-1 text-xs text-muted-foreground">
                                <li>• Top placement in Events feed</li>
                                <li>• Included in weekly featured email</li>
                                <li>• Highlighted styling</li>
                              </ul>
                            </div>
                          )}
                          <div className="border-t border-border pt-3">
                            <div className="flex justify-between">
                              <span className="font-semibold">Total (one-time)</span>
                              <span className="text-2xl font-bold text-primary">${totalMonthly.toFixed(2)}</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    {isFreeTrial
                      ? `Your first ${submissionType} is free. Regular pricing applies to future submissions.`
                      : submissionType === "venue"
                        ? "By subscribing, you agree to automatic monthly billing. You can cancel anytime from your organizer account settings."
                        : "One-time payment. Event will automatically expire after the end date."}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === "form") {
    const isCommunityVenue = submissionType === "venue" && venueListingType === "community"

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Adjusted navigation to go back to the new entry screen
                  setStep("entry")
                  setSubmissionType(null) // Reset submission type
                  setVenueListingType(null) // Reset venue type
                }}
              >
                ← Back
              </Button>
              {isCommunityVenue && (
                <Badge variant="secondary" className="gap-1">
                  <Gift className="h-3 w-3" />
                  Free Community Listing
                </Badge>
              )}
            </div>
            <h1 className="mb-2 text-4xl font-bold tracking-tight text-foreground">
              {isCommunityVenue
                ? "Submit Community Venue"
                : submissionType === "venue"
                  ? "Submit Your Venue"
                  : "Submit Your Event"}
            </h1>
            <p className="text-lg text-muted-foreground">
              {isCommunityVenue
                ? "Share a free community space like a park or playground with families"
                : submissionType === "venue"
                  ? "Tell us about your sensory-friendly venue"
                  : "Tell us about your sensory-friendly event"}
            </p>
          </div>

          <form ref={formRef} onSubmit={handleFormSubmit} className="space-y-6">
            {/* Venue/Business Information */}
            <Card>
              <CardHeader>
                <CardTitle>{isCommunityVenue ? "Venue Information" : "Business Information"}</CardTitle>
                <CardDescription>
                  {isCommunityVenue
                    ? "Basic details about the community space"
                    : "Basic details about your business or organization"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">
                    {isCommunityVenue ? "Venue Name" : submissionType === "venue" ? "Venue Name" : "Business Name"} *
                  </Label>
                  <Input
                    id="businessName"
                    required
                    placeholder={
                      isCommunityVenue
                        ? "e.g., Greenwood Community Playground"
                        : "e.g., Quiet Corner Cafe or Mindful Museum"
                    }
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  />
                </div>

                {submissionType === "venue" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="venueAddress">Address *</Label>
                      <Input
                        id="venueAddress"
                        required
                        placeholder="123 Main Street"
                        value={formData.venueAddress}
                        onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="venueCity">City *</Label>
                      <Input
                        id="venueCity"
                        required
                        placeholder="Philadelphia"
                        value={formData.venueCity}
                        onChange={(e) => setFormData({ ...formData, venueCity: e.target.value })}
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="">Select a category</option>
                    {isCommunityVenue ? (
                      <>
                        <option value="Park">Park</option>
                        <option value="Playground">Playground</option>
                        <option value="Garden">Garden</option>
                        <option value="Trail">Trail</option>
                        <option value="Beach">Beach</option>
                        <option value="Other">Other Public Space</option>
                      </>
                    ) : (
                      <>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventDescription">
                    Description *
                    {isCommunityVenue && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        (Include sensory-friendly features, quiet areas, playground type, etc.)
                      </span>
                    )}
                  </Label>
                  <textarea
                    id="eventDescription"
                    required
                    rows={4}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder={
                      isCommunityVenue
                        ? "Describe the space, its sensory-friendly features, accessibility, and what makes it special..."
                        : "Describe your venue or event..."
                    }
                    value={formData.eventDescription}
                    onChange={(e) => setFormData({ ...formData, eventDescription: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  {isCommunityVenue ? "Optional contact details (for questions or updates)" : "How can we reach you?"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">{isCommunityVenue ? "Your Name" : "Contact Name"}</Label>
                    <Input
                      id="contactName"
                      required={!isCommunityVenue}
                      placeholder="John Smith"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email {!isCommunityVenue && "*"}</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      required={!isCommunityVenue}
                      placeholder="john@example.com"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Phone {!isCommunityVenue && "*"}</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      required={!isCommunityVenue}
                      placeholder="(555) 123-4567"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactWebsite">Website</Label>
                    <Input
                      id="contactWebsite"
                      type="url"
                      placeholder="https://example.com"
                      value={formData.contactWebsite}
                      onChange={(e) => setFormData({ ...formData, contactWebsite: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sensory Features */}
            <Card>
              <CardHeader>
                <CardTitle>Sensory Features</CardTitle>
                <CardDescription>Help families understand what to expect</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  {[
                    "Quiet Space Available",
                    "Wheelchair Accessible",
                    "Sensory-Friendly Hours",
                    "Low Lighting",
                    "Natural Lighting",
                    "Low Crowd Density",
                    "Outdoor Space",
                    "Soft Surfaces",
                    "Shade Available",
                  ].map((feature) => (
                    <label key={feature} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.sensoryFeatures.includes(feature)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, sensoryFeatures: [...formData.sensoryFeatures, feature] })
                          } else {
                            setFormData({
                              ...formData,
                              sensoryFeatures: formData.sensoryFeatures.filter((f) => f !== feature),
                            })
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <span className="text-sm">{feature}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            {isCommunityVenue && (
              <Card className="border-accent/20 bg-accent/5">
                <CardContent className="flex items-start gap-3 p-6">
                  <Gift className="h-6 w-6 text-accent shrink-0 mt-0.5" />
                  <div>
                    <h3 className="mb-1 font-semibold">Free Community Listing</h3>
                    <p className="text-sm text-muted-foreground">
                      Your submission will be reviewed by our team and published within 24-48 hours. No payment or
                      billing information required. Community venues are labeled as "Community Venue" in search results.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {!isCommunityVenue && (
              <Card className="border-muted">
                <CardContent className="flex items-start gap-3 p-6">
                  <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      By submitting, you agree to our{" "}
                      <Link href="/terms-of-service" className="text-[#5BC0BE] hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/refund-policy" className="text-[#5BC0BE] hover:underline">
                        Refund & Advertising Policy
                      </Link>
                      . Review our policies before proceeding.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-3">
              <Button type="submit" size="lg" className="flex-1 gap-2">
                {isCommunityVenue ? (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    Submit for Review
                  </>
                ) : (
                  <>
                    Continue to {submissionType === "venue" ? "Verification" : "Payment"}
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // ... existing code for verification, checkout, and success steps ...

  return (
    <>
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Payments Coming Soon</CardTitle>
              <CardDescription>Your submission will be saved as pending</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Billing is currently disabled during beta testing. Your {submissionType} submission will be saved and
                  reviewed by our team. We'll notify you when it's approved!
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button onClick={handlePaymentModalConfirm} className="flex-1">
                  Continue
                </Button>
                <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
