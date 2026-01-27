"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ImageUpload } from "@/components/image-upload"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Loader2, Church } from "lucide-react"
import Link from "next/link"
import { isValidUrl, normalizeUrl } from "@/lib/url-utils"
import { checkSubmissionAccess } from "@/lib/submission-guard"
import { SensoryAccessibilitySection } from "@/components/submission-forms/sensory-accessibility-section"
import { WorshipSpecificSection } from "@/components/submission-forms/worship-specific-section"
import { SubmissionSuccessModal } from "@/components/submission-success-modal"
import type { NoiseLevel, LightingLevel, CrowdLevel, DensityLevel } from "@/lib/constants/sensory-fields"


export default function SubmitWorshipPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [checking, setChecking] = useState(true)
  const [images, setImages] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: "",
    denomination: "",
    description: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    serviceTimes: "",
    website: "",
    contactEmail: "",
    phone: "",
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
    sensoryFriendlyService: false,
    quietCryRoom: false,
    flexibleSeating: false,
    sensoryKits: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  useEffect(() => {
    checkAccess()
  }, [])

  const checkAccess = async () => {
    const result = await checkSubmissionAccess("/organizer/submit/worship")
    if (!result.allowed && result.redirect) {
      router.push(result.redirect)
    } else {
      setChecking(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = "Name is required"
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
      console.log("[v0] Submitting place of worship...")

      // Prepare sensory features for Supabase (converts nested objects to text array)
      const sensoryData = {
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
        worshipFeatures: {
          sensoryFriendlyService: formData.sensoryFriendlyService,
          quietCryRoom: formData.quietCryRoom,
          flexibleSeating: formData.flexibleSeating,
          sensoryKits: formData.sensoryKits,
        },
      }

      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          type: "place_of_worship",
          title: formData.name,
          denomination: formData.denomination,
          description: formData.description,
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
          },
          serviceTimes: formData.serviceTimes,
          website: formData.website ? normalizeUrl(formData.website) : "",
          contactEmail: formData.contactEmail,
          phone: formData.phone,
          sensory: sensoryData.sensory,
          accessibility: sensoryData.accessibility,
          sensorySupports: sensoryData.sensorySupports,
          worshipFeatures: sensoryData.worshipFeatures,
          images,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || result.details || "Submission failed")
      }

      console.log("[v0] Submission successful:", result.id)
      setShowSuccessModal(true)

      // Reset form
      setFormData({
        name: "",
        denomination: "",
        description: "",
        street: "",
        city: "",
        state: "",
        zip: "",
        serviceTimes: "",
        website: "",
        contactEmail: "",
        phone: "",
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
        sensoryFriendlyService: false,
        quietCryRoom: false,
        flexibleSeating: false,
        sensoryKits: false,
      })
      setImages([])
    } catch (error) {
      console.error("[v0] Submission error:", error)
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl pb-24">
      <Button asChild variant="ghost" className="mb-6 gap-2">
        <Link href="/submit">
          <ArrowLeft className="h-4 w-4" />
          Back to Submit Options
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Church className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Submit Place of Worship</CardTitle>
              <CardDescription>
                List your sensory-friendly worship space - always <strong>FREE</strong>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Community Church"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="denomination">Denomination/Affiliation (optional)</Label>
              <Input
                id="denomination"
                value={formData.denomination}
                onChange={(e) => setFormData({ ...formData, denomination: e.target.value })}
                placeholder="Non-denominational, Catholic, Jewish, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description * (50-1,000 characters)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your worship space, what makes it sensory-friendly, and what families can expect during services..."
                rows={6}
                className={errors.description ? "border-destructive" : ""}
              />
              <p className="text-xs text-muted-foreground">{formData.description.length} / 1,000 characters</p>
              {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="street">Street Address *</Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                placeholder="123 Main St"
                className={errors.street ? "border-destructive" : ""}
              />
              {errors.street && <p className="text-sm text-destructive">{errors.street}</p>}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Allentown"
                  className={errors.city ? "border-destructive" : ""}
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
                  maxLength={2}
                  className={errors.state ? "border-destructive" : ""}
                />
                {errors.state && <p className="text-sm text-destructive">{errors.state}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="zip">ZIP Code *</Label>
                <Input
                  id="zip"
                  value={formData.zip}
                  onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  placeholder="18101"
                  maxLength={5}
                  className={errors.zip ? "border-destructive" : ""}
                />
                {errors.zip && <p className="text-sm text-destructive">{errors.zip}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceTimes">Service Times (optional)</Label>
              <Input
                id="serviceTimes"
                value={formData.serviceTimes}
                onChange={(e) => setFormData({ ...formData, serviceTimes: e.target.value })}
                placeholder="Sunday 9am & 11am, Wednesday 7pm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website (optional)</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="example.com or https://example.com"
                className={errors.website ? "border-destructive" : ""}
              />
              {errors.website && <p className="text-sm text-destructive">{errors.website}</p>}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email (optional)</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="contact@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <ImageUpload images={images} onChange={setImages} />

            <SensoryAccessibilitySection
              noiseLevel={formData.noiseLevel}
              lightingLevel={formData.lightingLevel}
              crowdLevel={formData.crowdLevel}
              densityLevel={formData.densityLevel}
              wheelchairAccessible={formData.wheelchairAccessible}
              accessibleParking={formData.accessibleParking}
              accessibleRestroom={formData.accessibleRestroom}
              quietSpaceAvailable={formData.quietSpaceAvailable}
              sensoryFriendlyHours={formData.sensoryFriendlyHours}
              headphonesAllowed={formData.headphonesAllowed}
              staffTrained={formData.staffTrained}
              onNoiseChange={(value) => setFormData({ ...formData, noiseLevel: value })}
              onLightingChange={(value) => setFormData({ ...formData, lightingLevel: value })}
              onCrowdChange={(value) => setFormData({ ...formData, crowdLevel: value })}
              onDensityChange={(value) => setFormData({ ...formData, densityLevel: value })}
              onWheelchairChange={(checked) => setFormData({ ...formData, wheelchairAccessible: checked })}
              onAccessibleParkingChange={(checked) => setFormData({ ...formData, accessibleParking: checked })}
              onAccessibleRestroomChange={(checked) => setFormData({ ...formData, accessibleRestroom: checked })}
              onQuietSpaceChange={(checked) => setFormData({ ...formData, quietSpaceAvailable: checked })}
              onSensoryHoursChange={(checked) => setFormData({ ...formData, sensoryFriendlyHours: checked })}
              onHeadphonesChange={(checked) => setFormData({ ...formData, headphonesAllowed: checked })}
              onStaffTrainedChange={(checked) => setFormData({ ...formData, staffTrained: checked })}
              errors={errors}
            />

            <WorshipSpecificSection
              sensoryFriendlyService={formData.sensoryFriendlyService}
              quietCryRoom={formData.quietCryRoom}
              flexibleSeating={formData.flexibleSeating}
              sensoryKits={formData.sensoryKits}
              onSensoryServiceChange={(checked) => setFormData({ ...formData, sensoryFriendlyService: checked })}
              onQuietRoomChange={(checked) => setFormData({ ...formData, quietCryRoom: checked })}
              onFlexibleSeatingChange={(checked) => setFormData({ ...formData, flexibleSeating: checked })}
              onSensoryKitsChange={(checked) => setFormData({ ...formData, sensoryKits: checked })}
            />

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
              <strong>Free Forever:</strong> Places of worship submissions are always free as part of our community
              support initiative.
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Place of Worship"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      <SubmissionSuccessModal
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        type="place_of_worship"
      />
    </div>
  )
}
