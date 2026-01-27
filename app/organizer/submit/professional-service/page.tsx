"use client"

import { useState } from "react"
import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ImageUpload } from "@/components/image-upload"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { isValidUrl, normalizeUrl } from "@/lib/url-utils"
import { checkSubmissionAccess } from "@/lib/submission-guard"
import { SensoryAccessibilitySection } from "@/components/submission-forms/sensory-accessibility-section"
import type { NoiseLevel, LightingLevel, CrowdLevel, DensityLevel } from "@/lib/constants/sensory-fields"
import { SubmissionSuccessModal } from "@/components/submission-success-modal"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const SERVICE_CATEGORIES = [
  { value: "dentist", label: "Dentist" },
  { value: "pediatrician", label: "Pediatrician" },
  { value: "therapist", label: "Therapist" },
  { value: "occupational_therapy", label: "Occupational Therapy (OT)" },
  { value: "physical_therapy", label: "Physical Therapy (PT)" },
  { value: "speech_therapy", label: "Speech Therapy" },
  { value: "behavioral_therapy", label: "Behavioral Therapy (ABA)" },
  { value: "psychologist", label: "Psychologist" },
  { value: "psychiatrist", label: "Psychiatrist" },
  { value: "optometrist", label: "Optometrist" },
  { value: "audiologist", label: "Audiologist" },
  { value: "other", label: "Other" },
]

export default function SubmitProfessionalServicePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [checking, setChecking] = useState(true)
  const [images, setImages] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    hours: "",
    website: "",
    contactEmail: "",
    phone: "",
    appointmentRequired: false,
    insuranceAccepted: false,
    noiseLevel: "" as NoiseLevel | "",
    lightingLevel: "" as LightingLevel | "",
    crowdLevel: "" as CrowdLevel | "",
    densityLevel: "" as DensityLevel | "",
    wheelchairAccessible: false,
    accessibleParking: false,
    accessibleRestroom: false,
    quietSpaceAvailable: false,
    sensoryFriendlyHours: false,
    headphonesAllowed: false,
    staffTrained: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  useEffect(() => {
    checkAccess()
  }, [])

  const checkAccess = async () => {
    const result = await checkSubmissionAccess("/organizer/submit/professional-service")
    if (!result.allowed && result.redirect) {
      router.push(result.redirect)
    } else {
      setChecking(false)
    }
  }

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("[v0] ========== PROFESSIONAL SERVICE FORM SUBMIT ==========")
    e.preventDefault()
    setErrors({})

    const newErrors: Record<string, string> = {}
    if (!formData.title.trim()) newErrors.title = "Business name is required"
    if (!formData.category) newErrors.category = "Service category is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (formData.description.length < 50) newErrors.description = "Description must be at least 50 characters"
    if (formData.description.length > 1000) newErrors.description = "Description must be less than 1000 characters"
    if (!formData.street.trim()) newErrors.street = "Street address is required"
    if (!formData.city.trim()) newErrors.city = "City is required"
    if (!formData.state.trim()) newErrors.state = "State is required"
    if (!formData.zip.trim()) newErrors.zip = "ZIP code is required"
    if (!formData.noiseLevel) newErrors.noiseLevel = "Noise level is required"
    if (!formData.lightingLevel) newErrors.lightingLevel = "Lighting level is required"
    if (!formData.crowdLevel) newErrors.crowdLevel = "Crowd level is required"
    if (!formData.densityLevel) newErrors.densityLevel = "Density level is required"
    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = "Please enter a valid URL (e.g., example.com or https://example.com)"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      const sensoryFeaturesObject = {
        noiseLevel: formData.noiseLevel,
        lightingLevel: formData.lightingLevel,
        crowdLevel: formData.crowdLevel,
        densityLevel: formData.densityLevel,
        wheelchairAccessible: formData.wheelchairAccessible,
        accessibleParking: formData.accessibleParking,
        accessibleRestroom: formData.accessibleRestroom,
        quietSpaceAvailable: formData.quietSpaceAvailable,
        sensoryFriendlyHours: formData.sensoryFriendlyHours,
        headphonesAllowed: formData.headphonesAllowed,
        staffTrained: formData.staffTrained,
        hours: formData.hours,
        appointmentRequired: formData.appointmentRequired,
        insuranceAccepted: formData.insuranceAccepted,
      }

      const payload = {
        type: "professional_service",
        title: formData.title,
        description: formData.description,
        category: formData.category,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
        },
        hours: formData.hours,
        website: formData.website ? normalizeUrl(formData.website) : "",
        contactEmail: formData.contactEmail,
        phone: formData.phone,
        sensory: {
          noiseLevel: formData.noiseLevel,
          lightingLevel: formData.lightingLevel,
          crowdLevel: formData.crowdLevel,
          densityLevel: formData.densityLevel,
        },
        accessibility: {
          wheelchairAccessible: formData.wheelchairAccessible,
          accessibleParking: formData.accessibleParking,
          accessibleRestroom: formData.accessibleRestroom,
        },
        sensorySupports: {
          quietSpaceAvailable: formData.quietSpaceAvailable,
          sensoryFriendlyHours: formData.sensoryFriendlyHours,
          headphonesAllowed: formData.headphonesAllowed,
          staffTrained: formData.staffTrained,
        },
        professionalServiceFeatures: {
          appointmentRequired: formData.appointmentRequired,
          insuranceAccepted: formData.insuranceAccepted,
          hours: formData.hours,
        },
        images,
      }

      console.log("[v0] Payload:", JSON.stringify(payload, null, 2))

      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Submission failed")
      }

      console.log("[v0] Submission successful:", data)
      setShowSuccessModal(true)
    } catch (error) {
      console.error("[v0] Submission error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <SubmissionSuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false)
          router.push("/submit")
        }}
        listingType="professional_service"
      />

      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/submit">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Submit a Professional Service</h1>
          <p className="text-muted-foreground">Add a sensory-friendly practice or service provider</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Tell us about the professional service</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Business/Practice Name *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Sensory-Friendly Dental Care"
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Service Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description * (50-1,000 characters)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe how your practice accommodates sensory needs, what makes it sensory-friendly, and what patients can expect..."
                rows={5}
              />
              <p className="text-xs text-muted-foreground">{formData.description.length}/1000 characters</p>
              {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location & Contact</CardTitle>
            <CardDescription>Where can people find you?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="street">Street Address *</Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                placeholder="123 Main Street"
              />
              {errors.street && <p className="text-sm text-destructive">{errors.street}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Philadelphia"
                />
                {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="PA"
                />
                {errors.state && <p className="text-sm text-destructive">{errors.state}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP Code *</Label>
                <Input
                  id="zip"
                  value={formData.zip}
                  onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  placeholder="19103"
                />
                {errors.zip && <p className="text-sm text-destructive">{errors.zip}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="contact@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="example.com"
              />
              {errors.website && <p className="text-sm text-destructive">{errors.website}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hours">Hours of Operation</Label>
              <Input
                id="hours"
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                placeholder="Mon-Fri 9am-5pm"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
            <CardDescription>Additional information about your practice</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="appointmentRequired">Appointment Required</Label>
                <p className="text-xs text-muted-foreground">Do patients need to schedule an appointment?</p>
              </div>
              <Switch
                id="appointmentRequired"
                checked={formData.appointmentRequired}
                onCheckedChange={(checked) => setFormData({ ...formData, appointmentRequired: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="insuranceAccepted">Insurance Accepted</Label>
                <p className="text-xs text-muted-foreground">Do you accept insurance?</p>
              </div>
              <Switch
                id="insuranceAccepted"
                checked={formData.insuranceAccepted}
                onCheckedChange={(checked) => setFormData({ ...formData, insuranceAccepted: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <SensoryAccessibilitySection
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          listingType="professional_service"
        />

        <Card>
          <CardHeader>
            <CardTitle>Photos</CardTitle>
            <CardDescription>Add photos of your practice (optional but recommended)</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload images={images} onImagesChange={setImages} maxImages={5} />
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="button" variant="outline" asChild className="flex-1 bg-transparent">
            <Link href="/submit">Cancel</Link>
          </Button>
          <Button type="submit" className="flex-1" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit for Review"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
