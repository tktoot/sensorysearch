"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, AlertCircle, CheckCircle2 } from "lucide-react"

interface EmailVerificationProps {
  email: string
  onVerified: () => void
}

export function EmailVerification({ email, onVerified }: EmailVerificationProps) {
  const [step, setStep] = useState<"send" | "verify">("send")
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [codeSent, setCodeSent] = useState(false)

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Simulate sending verification email
    await new Promise((resolve) => setTimeout(resolve, 1500))

    console.log("[v0] Sending verification code to:", email)

    setLoading(false)
    setCodeSent(true)
    setStep("verify")
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Simulate code verification
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In production, this would verify via API
    // For demo, accept any 6-digit code
    if (code.length === 6) {
      console.log("[v0] Email verified for:", email)
      onVerified()
    } else {
      setError("Invalid verification code. Please try again.")
    }

    setLoading(false)
  }

  const handleResendCode = async () => {
    setError("")
    setLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log("[v0] Resending verification code to:", email)

    setLoading(false)
    setCodeSent(true)
  }

  if (step === "send") {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Email Verification</CardTitle>
              <CardDescription>Verify your email to continue</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendCode} className="space-y-4">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <div className="rounded-lg border bg-muted/50 p-3">
                <p className="text-sm font-medium">{email}</p>
              </div>
              <p className="text-xs text-muted-foreground">We'll send a 6-digit verification code to this email</p>
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
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Enter Verification Code</CardTitle>
            <CardDescription>Check your email at {email}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerifyCode} className="space-y-4">
          {codeSent && (
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-sm text-primary">
              <CheckCircle2 className="h-4 w-4" />
              Verification code sent! Check your inbox.
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="code">6-Digit Code</Label>
            <Input
              id="code"
              type="text"
              placeholder="123456"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              required
            />
            <p className="text-xs text-muted-foreground">Enter the 6-digit code we sent to your email</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Verifying..." : "Verify Email"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setStep("send")
                setCode("")
                setError("")
                setCodeSent(false)
              }}
            >
              Back
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={handleResendCode}
            disabled={loading}
          >
            Resend Code
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
