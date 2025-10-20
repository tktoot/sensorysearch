"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Phone, AlertCircle } from "lucide-react"

interface PhoneVerificationProps {
  onVerified: (phoneNumber: string) => void
  initialPhone?: string
}

export function PhoneVerification({ onVerified, initialPhone = "" }: PhoneVerificationProps) {
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [phoneNumber, setPhoneNumber] = useState(initialPhone)
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Simulate OTP sending
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In production, this would call an API to send SMS
    console.log("[v0] Sending OTP to:", phoneNumber)

    setLoading(false)
    setStep("otp")
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Simulate OTP verification
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In production, this would verify the OTP via API
    if (otp === "123456" || otp.length === 6) {
      console.log("[v0] OTP verified for:", phoneNumber)
      onVerified(phoneNumber)
    } else {
      setError("Invalid verification code. Please try again.")
    }

    setLoading(false)
  }

  if (step === "phone") {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Phone Verification</CardTitle>
              <CardDescription>Required to prevent spam and abuse</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">We'll send you a verification code via SMS</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Sending..." : "Send Verification Code"}
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Phone className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Enter Verification Code</CardTitle>
            <CardDescription>Sent to {phoneNumber}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">6-Digit Code</Label>
            <Input
              id="otp"
              type="text"
              placeholder="123456"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              required
            />
            <p className="text-xs text-muted-foreground">Enter the 6-digit code we sent to your phone</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Verifying..." : "Verify Code"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setStep("phone")
                setOtp("")
                setError("")
              }}
            >
              Change Number
            </Button>
          </div>

          <Button type="button" variant="ghost" size="sm" className="w-full" onClick={handleSendOTP}>
            Resend Code
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
