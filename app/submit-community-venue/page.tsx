"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, CheckCircle2, TreePine, Upload, Info } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Venue } from "@/lib/mock-data"

const VENUE_TYPES = ["Park", "Playground", "Trail", "Other"] as const
const FEATURES = [
  { id: "quiet", label: "Quiet areas" },
  { id: "shaded", label: "Shaded areas" },
  { id: "fenced", label: "Fenced" },
  { id: "accessible", label: "Accessible equipment" },
  { id: "smooth", label: "Smooth paths" },
  { id: "restrooms", label: "Restrooms" },
] as const

export default function SubmitCommunityVenuePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const [images, setImages] = useState<string[]>([])
  const [formData, setFormData] = useState({
    email: "",
    venueName: "",
    venueType: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    description: "",
    features: [] as string[],
    website: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Required fields
    if (!formData.venueName) newErrors.venueName = "Venue name is required"
    if (!formData.venueType) newErrors.venueType = "Please select a venue type"
    if (!formData.city) newErrors.city = "City is required"
    if (!formData.state) newErrors.state = "State is required"
    if (!formData.description) newErrors.description = "Description is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    // Create venue object
    const newVenue: Venue = {
      id: `community-${Date.now()}`,
      name: formData.venueName,
      type: "venue_community",
      listingType: "community",
      isFree: true,
      address: formData.street || undefined,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zip || undefined,
      description: formData.description,
      features: formData.features,
      website: formData.website || undefined,
      contactEmail: formData.email,
      imageUrl: images[0] || "/park-playground.jpg",
      rating: 0,
      reviewCount: 0,
      ageRange: ["all"],
      tags: [formData.venueType.toLowerCase(), "outdoor", "free"],
      sensoryAttributes: {
        noiseLevel: "quiet",
        crowdLevel: "low",
        lightingType: "natural",
      },
      status: "pending",
      submittedAt: new Date().toISOString(),
      submittedBy: formData.email,
    }

    // Save to localStorage
    const existingVenues = JSON.parse(localStorage.getItem("venues") || "[]")
    existingVenues.push(newVenue)
    localStorage.setItem("venues", JSON.stringify(existingVenues))

    console.log("[v0] Community venue submitted:", newVenue)

    setIsSubmitting(false)
    setShowSuccess(true)

    // Redirect after 3 seconds
    setTimeout(() => {
      router.push("/discover")
    }, 3000)
  }

  const handleFeatureToggle = (featureId: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter((f) => f !== featureId)
        : [...prev.features, featureId],
    }))
  }

  if (showSuccess) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="mx-auto max-w-2xl border-green-200 bg-green-50/50">
          <CardContent className="flex flex-col items-center gap-6 p-12 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-foreground">Thank You!</h2>
              <p className="text-lg text-muted-foreground">
                Your community venue has been submitted for review. We'll notify you at {formData.email} once it's
                approved.
              </p>
            </div>
            <Button asChild size="lg" variant="outline" className="gap-2 bg-transparent">
              <Link href="/discover">
                Browse Venues
                <ArrowLeft className="h-5 w-5 rotate-180" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link href="/advertise">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Advertise
            </Link>
          </Button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <TreePine className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">List a Community Venue</h1>
              <p className="text-muted-foreground">Parks, playgrounds, and outdoor spaces — 100% free</p>
            </div>
          </div>

          <Alert className="border-green-200 bg-green-50/50">
            <Info className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-900">
              Add a community venue so families can find calm, inclusive outdoor spaces near them. No account or payment
              required.
            </AlertDescription>
          </Alert>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Email */}
          <Card>
            <CardHeader>
              <CardTitle>Your Contact Information</CardTitle>
              <CardDescription>We'll use this to notify you when your venue is approved</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Venue Details */}
          <Card>
            <CardHeader>
              <CardTitle>Venue Details</CardTitle>
              <CardDescription>Tell us about this community space</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Venue Name */}
              <div className="space-y-2">
                <Label htmlFor="venueName">
                  Venue Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="venueName"
                  placeholder="e.g., Smith Memorial Playground"
                  value={formData.venueName}
                  onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                  className={errors.venueName ? "border-destructive" : ""}
                />
                {errors.venueName && <p className="text-sm text-destructive">{errors.venueName}</p>}
              </div>

              {/* Venue Type */}
              <div className="space-y-2">
                <Label htmlFor="venueType">
                  Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.venueType}
                  onValueChange={(value) => setFormData({ ...formData, venueType: value })}
                >
                  <SelectTrigger className={errors.venueType ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select venue type" />
                  </SelectTrigger>
                  <SelectContent>
                    {VENUE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.venueType && <p className="text-sm text-destructive">{errors.venueType}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
              <CardDescription>Where is this venue located?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  placeholder="123 Main St"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">
                    City <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="city"
                    placeholder="Philadelphia"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className={errors.city ? "border-destructive" : ""}
                  />
                  {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">
                    State <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="state"
                    placeholder="PA"
                    maxLength={2}
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                    className={errors.state ? "border-destructive" : ""}
                  />
                  {errors.state && <p className="text-sm text-destructive">{errors.state}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    placeholder="19103"
                    maxLength={5}
                    value={formData.zip}
                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
              <CardDescription>
                Describe sensory-friendly features, quiet areas, crowd levels, lighting, etc.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="description">
                  Venue Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="This park features quiet shaded areas, accessible playground equipment, and smooth paved paths. It's typically less crowded in the mornings..."
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={errors.description ? "border-destructive" : ""}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
              <CardDescription>Select all that apply</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {FEATURES.map((feature) => (
                  <div key={feature.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={feature.id}
                      checked={formData.features.includes(feature.id)}
                      onCheckedChange={() => handleFeatureToggle(feature.id)}
                    />
                    <Label htmlFor={feature.id} className="cursor-pointer font-normal">
                      {feature.label}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Optional Info */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>Optional details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website or Park Page</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://..."
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>

              <ImageUpload images={images} onChange={setImages} maxImages={1} />
            </CardContent>

          {/* Submit */}
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
                  <Link href="/privacy-policy" className="text-[#5BC0BE] hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/advertise">Cancel</Link>
            </Button>
            <Button type="submit" size="lg" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? "Submitting..." : "Publish Community Venue (Free)"}
              <CheckCircle2 className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
