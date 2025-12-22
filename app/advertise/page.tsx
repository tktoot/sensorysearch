"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, ArrowRight, Calendar, Building2, Info, TreePine } from "lucide-react"
import { useRouter } from "next/navigation"
import { isEligibleForFreeTrial, isEmailDomainWhitelisted, type UserProfile } from "@/lib/mock-data"
import { getCurrentUser } from "@/lib/auth-utils"
import { BILLING_ENABLED } from "@/lib/config"
import { Alert, AlertDescription } from "@/components/ui/alert"

type SubmissionType = "venue" | "event" | null
// Renamed to venueListingType to be more descriptive
type VenueListingType = "business" | "community" | null

export default function AdvertisePage() {
  const router = useRouter()
  const formRef = useRef<HTMLDivElement>(null)
  const benefitsRef = useRef<HTMLDivElement>(null)
  const [submissionType, setSubmissionType] = useState<SubmissionType>(null)
  const [venueListingType, setVenueListingType] = useState<VenueListingType>(null) // Renamed from venueType
  const [step, setStep] = useState<"entry">("entry")
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
      // Only redirect if user is already an organizer - they should use /submit instead
      if (user && (user.role === "organizer" || user.role === "admin")) {
        router.push("/submit")
      }
    }
    checkOrganizerStatus()
  }, [router])
  // </CHANGE>

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

  // Users can now access all listing options without being redirected
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }
  // </CHANGE>

  // The following block was removed as it's now handled by the new entry screen logic
  // and the business account check has been removed.
  // if (!isLoading && !isBusinessAccount && step !== "entry") {
  //   return (
  //     <div className="container mx-auto px-4 py-16">
  //       <Card className="mx-auto max-w-2xl border-primary/20">
  //         <CardContent className="flex flex-col items-center gap-6 p-12 text-center">
  //           <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
  //             <AlertCircle className="h-10 w-10 text-primary" />
  //           </div>
  //           <div className="space-y-2">
  //             <h2 className="text-3xl font-bold text-foreground">Organizer Account Required</h2>
  //             <p className="text-lg text-muted-foreground">
  //               You need an organizer account to submit paid events and venues. Upgrade your account to get started.
  //             </p>
  //           </div>
  //           <Button asChild size="lg" className="gap-2">
  //             <a href="/profile">
  //               <ArrowRight className="h-5 w-5" />
  //               Upgrade to Organizer Account
  //             </a>
  //           </Button>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   )
  // }

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const scrollToBenefits = () => {
    benefitsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("[v0] ADVERTISE_FORM_SUBMIT", { type: submissionType, venueListingType })

    try {
      const response = await fetch("/api/advertise-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: formData.businessName,
          contactName: formData.contactName,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone,
          contactWebsite: formData.contactWebsite,
          eventTitle: formData.eventTitle,
          description: formData.eventDescription,
          address: formData.venueAddress,
          city: formData.venueCity,
          category: formData.category,
          sensoryFeatures: formData.sensoryFeatures,
          isVenue: submissionType === "venue",
          isEvent: submissionType === "event",
          isFeatured: isFeaturedEvent,
        }),
      })

      if (response.ok) {
        console.log("[v0] ADVERTISE_EMAIL_SENT")
        setStep("success")
        window.scrollTo({ top: 0, behavior: "smooth" })
      } else {
        console.error("[v0] ADVERTISE_EMAIL_FAILED", await response.text())
        alert("Submission failed. Please try again.")
      }
    } catch (error) {
      console.error("[v0] ADVERTISE_EMAIL_ERROR", error)
      alert("An error occurred. Please try again.")
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
            {/* Event Option - Free */}
            <Card
              className="group cursor-pointer border-2 transition-all hover:border-primary hover:shadow-lg relative"
              onClick={() => router.push("/organizer/submit/event")}
            >
              <div className="absolute top-4 right-4">
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                  Free
                </Badge>
              </div>
              <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">List an Event</h2>
                  <p className="text-sm text-muted-foreground">Free during beta</p>
                </div>
                <ul className="space-y-2 text-left text-sm text-muted-foreground w-full">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Upload photos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Perfect for workshops, classes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>100% free listing</span>
                  </li>
                </ul>
                <Button size="lg" className="w-full gap-2 mt-2">
                  Choose Event
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </CardContent>
            </Card>

            {/* Business Venue Option - Free */}
            <Card
              className="group cursor-pointer border-2 transition-all hover:border-primary hover:shadow-lg relative"
              onClick={() => router.push("/organizer/submit/venue")}
            >
              <div className="absolute top-4 right-4">
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                  Free
                </Badge>
              </div>
              <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">Business Venue</h2>
                  <p className="text-sm text-muted-foreground">Free during beta</p>
                </div>
                <ul className="space-y-2 text-left text-sm text-muted-foreground w-full">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Upload photos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>For cafes, museums, businesses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>100% free listing</span>
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
              onClick={() => router.push("/organizer/submit/park")}
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
                  <h2 className="text-2xl font-bold text-foreground">Parks & Playgrounds</h2>
                  <p className="text-sm text-muted-foreground">Community Spaces</p>
                </div>
                <ul className="space-y-2 text-left text-sm text-muted-foreground w-full">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>Upload photos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>For parks, playgrounds, trails</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>100% free listing</span>
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

  return null
}
