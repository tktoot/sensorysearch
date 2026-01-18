"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Building2, CreditCard, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react"
import { PhoneVerification } from "@/components/phone-verification"
import { EmailVerification } from "@/components/email-verification"

// Define minimal types needed for this component
interface UserProfile {
  email?: string
  role?: string
}

interface BusinessUpgradeFlowProps {
  open: boolean
  onClose: () => void
  onComplete: (updatedProfile: any) => void
  currentProfile: UserProfile
}

function isEmailDomainWhitelisted(email: string): boolean {
  const whitelistedDomains = ["example.org", "nonprofit.org"]
  const domain = email.split("@")[1]
  return whitelistedDomains.includes(domain)
}

export function BusinessUpgradeFlow({ open, onClose, onComplete, currentProfile }: BusinessUpgradeFlowProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [businessInfo, setBusinessInfo] = useState({
    business_name: "",
    business_website: "",
    business_contact_phone: "",
  })
  const [emailVerified, setEmailVerified] = useState(false)
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [verifiedPhone, setVerifiedPhone] = useState("")

  if (!open) return null

  const handleBusinessInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(2)
  }

  const handleEmailVerified = () => {
    setEmailVerified(true)
    setStep(3)
  }

  const handlePhoneVerified = (phoneNumber: string) => {
    setPhoneVerified(true)
    setVerifiedPhone(phoneNumber)
    setStep(4)
  }

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const isWhitelisted = currentProfile.email ? isEmailDomainWhitelisted(currentProfile.email) : false

    // Update profile with business info
    const updatedProfile: any = {
      ...currentProfile,
      role: "business",
      business_verified: true,
      has_payment_method_on_file: !isWhitelisted, // Only require payment if not whitelisted
      business_name: businessInfo.business_name,
      business_website: businessInfo.business_website,
      business_contact_phone: businessInfo.business_contact_phone,
      phone_number: verifiedPhone,
      phone_verified_at: new Date().toISOString(),
      email_verified: true,
      billing_payment_method_id: isWhitelisted ? null : `pm_${Date.now()}`,
      is_domain_whitelisted: isWhitelisted,
      free_trial_used: false, // First event will be free
    }

    onComplete(updatedProfile)
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            {/* Progress Indicator */}
            <div className="mb-6 flex items-center justify-center gap-2">
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="flex items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                      step >= num ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step > num ? <CheckCircle2 className="h-5 w-5" /> : num}
                  </div>
                  {num < 4 && <div className={`h-0.5 w-12 ${step > num ? "bg-primary" : "bg-muted"}`} />}
                </div>
              ))}
            </div>

            {/* Step 1: Business Info */}
            {step === 1 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Business Information</CardTitle>
                      <CardDescription>Tell us about your business</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBusinessInfoSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="business_name">Business Name *</Label>
                      <Input
                        id="business_name"
                        required
                        placeholder="Your Business Name"
                        value={businessInfo.business_name}
                        onChange={(e) => setBusinessInfo({ ...businessInfo, business_name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="business_website">Website</Label>
                      <Input
                        id="business_website"
                        type="url"
                        placeholder="https://yourbusiness.com"
                        value={businessInfo.business_website}
                        onChange={(e) => setBusinessInfo({ ...businessInfo, business_website: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="business_contact_phone">Contact Phone *</Label>
                      <Input
                        id="business_contact_phone"
                        type="tel"
                        required
                        placeholder="(555) 123-4567"
                        value={businessInfo.business_contact_phone}
                        onChange={(e) => setBusinessInfo({ ...businessInfo, business_contact_phone: e.target.value })}
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button type="submit" className="flex-1 gap-2">
                        Continue
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Email Verification */}
            {step === 2 && (
              <div className="space-y-4">
                <EmailVerification email={currentProfile.email || ""} onVerified={handleEmailVerified} />
                <Button variant="outline" onClick={() => setStep(1)} className="w-full gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </div>
            )}

            {/* Step 3: Phone Verification */}
            {step === 3 && (
              <div className="space-y-4">
                <PhoneVerification
                  onVerified={handlePhoneVerified}
                  initialPhone={businessInfo.business_contact_phone}
                />
                <Button variant="outline" onClick={() => setStep(2)} className="w-full gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </div>
            )}

            {/* Step 4: Payment Method */}
            {step === 4 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Add Payment Method</CardTitle>
                      <CardDescription>
                        {currentProfile.email && isEmailDomainWhitelisted(currentProfile.email)
                          ? "Your organization is whitelisted - no payment required!"
                          : "Required for future event submissions"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <Badge variant="secondary" className="mb-2">
                      Your first event is free!
                    </Badge>

                    {currentProfile.email && isEmailDomainWhitelisted(currentProfile.email) ? (
                      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                        <p className="text-sm text-muted-foreground">
                          Your email domain is whitelisted. You can submit unlimited events without payment!
                        </p>
                      </div>
                    ) : (
                      <>
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

                        <p className="text-xs text-muted-foreground">
                          Your card will not be charged for your first event. Regular pricing of $9.99/month applies
                          after your free trial.
                        </p>
                      </>
                    )}

                    <div className="flex gap-3 pt-4">
                      <Button type="submit" className="flex-1 gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Complete Upgrade
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setStep(3)}>
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
