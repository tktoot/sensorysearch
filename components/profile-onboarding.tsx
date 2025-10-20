"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { UserIcon, Users, CheckCircle2 } from "lucide-react"
import type { UserProfile } from "@/lib/mock-data"

interface ProfileOnboardingProps {
  onComplete: (profile: UserProfile) => void
  initialProfile?: Partial<UserProfile>
}

export function ProfileOnboarding({ onComplete, initialProfile }: ProfileOnboardingProps) {
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    name: initialProfile?.name || "",
    email: initialProfile?.email || "",
    agePreference: initialProfile?.agePreference || null,
  })

  const totalSteps = 3
  const progress = (step / totalSteps) * 100

  const ageOptions = [
    { value: "toddlers", label: "Toddlers", description: "0-5 years", emoji: "👶" },
    { value: "children", label: "Children", description: "6-12 years", emoji: "🧒" },
    { value: "teens", label: "Teens", description: "13-17 years", emoji: "👦" },
    { value: "adults", label: "Adults", description: "18+ years", emoji: "👤" },
  ] as const

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      // Complete onboarding
      onComplete(profile as UserProfile)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return profile.name && profile.name.trim().length > 0
      case 2:
        return profile.email && profile.email.includes("@")
      case 3:
        return profile.agePreference !== null
      default:
        return false
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <Badge variant="secondary" className="text-xs">
              Step {step} of {totalSteps}
            </Badge>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="mb-4" />
          <CardTitle className="text-2xl">
            {step === 1 && "Welcome to Sensory Search!"}
            {step === 2 && "Contact Information"}
            {step === 3 && "Who are you supporting?"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Let's start by getting to know you"}
            {step === 2 && "We'll use this to personalize your experience"}
            {step === 3 && "Help us show you the most relevant events"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Name */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-center mb-6">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserIcon className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={profile.name || ""}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Step 2: Email */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={profile.email || ""}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  We'll use this to save your preferences and send you updates about events you might like.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Age Preference */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-center mb-6">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </div>
              <Label>Age group of the person with sensory needs</Label>
              <div className="grid gap-3 md:grid-cols-2">
                {ageOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setProfile({ ...profile, agePreference: option.value })}
                    className={`flex flex-col items-start gap-2 rounded-lg border-2 p-4 text-left transition-all hover:border-primary/50 ${
                      profile.agePreference === option.value ? "border-primary bg-primary/5" : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <span className="text-2xl">{option.emoji}</span>
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{option.label}</div>
                        <div className="text-sm text-muted-foreground">{option.description}</div>
                      </div>
                      {profile.agePreference === option.value && <CheckCircle2 className="h-5 w-5 text-primary" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack} className="flex-1 bg-transparent">
                Back
              </Button>
            )}
            <Button onClick={handleNext} disabled={!canProceed()} className="flex-1">
              {step === totalSteps ? "Complete Setup" : "Continue"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
