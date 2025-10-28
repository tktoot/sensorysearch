"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { isValidUrl, normalizeUrl } from "@/lib/url-utils"

export default function SubmitVenuePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    hours: "",
    website: "",
    contactEmail: "",
    phone: "",
    lowNoise: false,
    gentleLighting: false,
    crowdManaged: false,
    quietRoom: false,
    visualAids: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validation
    const newErrors: Record<string, string> = {}
    if (!formData.title.trim()) newErrors.title = "Title is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (formData.description.length < 300) newErrors.description = "Description must be at least 300 characters"
    if (formData.description.length > 1000) newErrors.description = "Description must be less than 1000 characters"
    if (!formData.street.trim()) newErrors.street = "Street address is required"
    if (!formData.city.trim()) newErrors.city = "City is required"
    if (!formData.state.trim()) newErrors.state = "State is required"
    if (!formData.zip.trim()) newErrors.zip = "ZIP code is required"
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
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "venue",
          title: formData.title,
          description: formData.description,
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
          sensoryAttributes: {
            lowNoise: formData.lowNoise,
            gentleLighting: formData.gentleLighting,
            crowdManaged: formData.crowdManaged,
            quietRoom: formData.quietRoom,
            visualAids: formData.visualAids,
          },
          images,
        }),
      })

      if (!response.ok) {
        throw new Error("Submission failed")
      }

      toast({
        title: "Submitted for Review",
        description: "You'll be notified after approval.",
      })

      router.push("/organizer")
    } catch (error) {
      console.error("[v0] Submission error:", error)
      toast({
        title: "Submission Failed",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button asChild variant="ghost" className="mb-6 gap-2">
        <Link href="/organizer">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Submit Venue</CardTitle>
          <CardDescription>List a permanent sensory-friendly venue for families to discover</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Venue Name *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Quiet Corner Cafe"
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description * (300-1,000 characters)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your venue, what makes it sensory-friendly, and what families can expect..."
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
              <Label htmlFor="hours">Hours (optional)</Label>
              <Input
                id="hours"
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                placeholder="Mon-Fri 9am-5pm, Sat-Sun 10am-4pm"
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

            <div className="space-y-3">
              <Label>Sensory Attributes</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="lowNoise"
                    checked={formData.lowNoise}
                    onCheckedChange={(checked) => setFormData({ ...formData, lowNoise: checked as boolean })}
                  />
                  <label htmlFor="lowNoise" className="text-sm cursor-pointer">
                    Low Noise Environment
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="gentleLighting"
                    checked={formData.gentleLighting}
                    onCheckedChange={(checked) => setFormData({ ...formData, gentleLighting: checked as boolean })}
                  />
                  <label htmlFor="gentleLighting" className="text-sm cursor-pointer">
                    Gentle Lighting
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="crowdManaged"
                    checked={formData.crowdManaged}
                    onCheckedChange={(checked) => setFormData({ ...formData, crowdManaged: checked as boolean })}
                  />
                  <label htmlFor="crowdManaged" className="text-sm cursor-pointer">
                    Crowd Managed
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="quietRoom"
                    checked={formData.quietRoom}
                    onCheckedChange={(checked) => setFormData({ ...formData, quietRoom: checked as boolean })}
                  />
                  <label htmlFor="quietRoom" className="text-sm cursor-pointer">
                    Quiet Room Available
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="visualAids"
                    checked={formData.visualAids}
                    onCheckedChange={(checked) => setFormData({ ...formData, visualAids: checked as boolean })}
                  />
                  <label htmlFor="visualAids" className="text-sm cursor-pointer">
                    Visual Aids Provided
                  </label>
                </div>
              </div>
            </div>

            <ImageUpload images={images} onChange={setImages} maxImages={1} />

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Venue"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
