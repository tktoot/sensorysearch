"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { GOOGLE_LOGIN_ENABLED, APPLE_LOGIN_ENABLED } from "@/lib/config"

export default function IntroContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextUrl = searchParams.get("next") || "/discover"
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [authMode, setAuthMode] = useState<"signup" | "signin">("signin") // Changed default from "signup" to "signin"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      console.log("[v0] IntroContent: Checking auth status")
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        console.log("[v0] IntroContent: Session found, checking onboarding")

        const { data: profile } = await supabase
          .from("profiles")
          .select("has_seen_onboarding")
          .eq("id", session.user.id)
          .single()

        if (profile?.has_seen_onboarding) {
          console.log("[v0] IntroContent: User has seen onboarding, redirecting to", nextUrl)
          router.push(nextUrl)
        } else {
          console.log("[v0] IntroContent: User needs onboarding, showing intro")
          setIsCheckingAuth(false)
        }
      } else {
        console.log("[v0] No active session, showing intro")
        setIsCheckingAuth(false)
      }
    } catch (err) {
      console.error("[v0] IntroContent: Error checking auth:", err)
      setIsCheckingAuth(false)
    }
  }

  const nextSlide = () => {
    if (currentSlide < 2) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const supabase = createClient()

      if (authMode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}${nextUrl}`,
          },
        })

        if (error) throw error

        console.log("[v0] AUTH_SIGN_UP_SUCCESS", { email })

        if (data.session) {
          await supabase.from("profiles").upsert({
            id: data.session.user.id,
            email: data.session.user.email,
            has_seen_onboarding: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          console.log("[v0] Marked onboarding complete")
        }

        if (process.env.NEXT_PUBLIC_BETA_ENABLED === "true") {
          fetch("/api/notify-signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          }).catch((err) => console.error("[v0] Failed to notify admin:", err))
        }

        if (data.user && !data.session) {
          setError(
            "Please check your email to confirm your account. If you don't see the email, check your spam folder.",
          )
        } else {
          router.push(nextUrl)
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        console.log("[v0] AUTH_SIGN_IN_SUCCESS", { email })

        if (data.session) {
          await supabase.from("profiles").upsert(
            {
              id: data.session.user.id,
              email: data.session.user.email,
              has_seen_onboarding: true,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "id",
            },
          )
          console.log("[v0] Marked onboarding complete")
        }

        router.push(nextUrl)
      }
    } catch (err: any) {
      console.error("[v0] AUTH_ERROR", err.message)

      if (err.message.includes("Invalid login credentials")) {
        if (authMode === "signin") {
          setError("Invalid email or password. Please try again or sign up for a new account.")
        } else {
          setError("This email is already registered. Try signing in instead.")
        }
      } else {
        setError(err.message || "Authentication failed")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: "google" | "apple") => {
    setIsLoading(true)
    setError("")

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}${nextUrl}`,
        },
      })

      if (error) throw error

      console.log("[v0] AUTH_OAUTH_INITIATED", { provider })
    } catch (err: any) {
      console.error("[v0] AUTH_OAUTH_ERROR", err)
      setError(err.message || "OAuth sign-in failed")
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-gradient-to-br from-[#5BC0BE] via-[#C8A2C8] to-[#F8E9A1] overflow-hidden"
      onTouchStart={(e) => {
        if (e.targetTouches.length > 0) {
          setTouchStart(e.targetTouches[0].clientX)
        }
      }}
      onTouchMove={(e) => {
        if (e.targetTouches.length > 0) {
          setTouchEnd(e.targetTouches[0].clientX)
        }
      }}
      onTouchEnd={() => {
        if (touchStart - touchEnd > 75) {
          nextSlide()
        }

        if (touchStart - touchEnd < -75) {
          prevSlide()
        }
      }}
    >
      <div
        className={`absolute inset-0 transition-all duration-700 ease-in-out ${
          currentSlide === 0 ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
        }`}
      >
        <div className="flex h-full flex-col items-center justify-center px-6 text-center">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(91,192,190,0.3),transparent_50%)] animate-pulse" />
          </div>

          <div className="relative z-10 mb-8">
            <div className="animate-[float_3s_ease-in-out_infinite]">
              <div className="relative h-32 w-32 animate-[pulse_2s_ease-in-out_infinite]">
                <Image
                  src="/icons/puzzle-pin.png"
                  alt="SensorySearch puzzle pin logo"
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </div>
            </div>
          </div>

          <h1 className="mb-4 text-5xl font-heading font-bold text-white drop-shadow-lg animate-[fadeIn_1s_ease-in_0.5s_both]">
            SensorySearch
          </h1>

          <p className="mb-12 text-xl text-white/90 drop-shadow animate-[fadeIn_1s_ease-in_1s_both]">
            Your map to sensory-friendly living.
          </p>

          <Button
            size="lg"
            onClick={nextSlide}
            className="bg-white text-primary hover:bg-white/90 shadow-xl animate-[fadeIn_1s_ease-in_1.5s_both]"
          >
            Next
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            <div className="h-2 w-8 rounded-full bg-white" />
            <div className="h-2 w-2 rounded-full bg-white/40" />
            <div className="h-2 w-2 rounded-full bg-white/40" />
          </div>
        </div>
      </div>

      <div
        className={`absolute inset-0 transition-all duration-700 ease-in-out ${
          currentSlide === 1
            ? "translate-x-0 opacity-100"
            : currentSlide < 1
              ? "translate-x-full opacity-0"
              : "-translate-x-full opacity-0"
        }`}
      >
        <div className="flex h-full flex-col items-center justify-center px-6 text-center overflow-y-auto py-12">
          <div className="max-w-2xl">
            <h2 className="mb-6 text-4xl font-heading font-bold text-white drop-shadow-lg">Why SensorySearch Exists</h2>

            <div className="mb-8 text-lg text-white/95 drop-shadow leading-[1.4]">
              <p className="mb-3">
                SensorySearch was created by a dad for families navigating the world with sensory needs.
              </p>
              <p className="mb-3">
                It was inspired by the real-life experience of a family raising a four-year-old son with autism, and
                understanding how isolating it can feel when the world isn't always built for inclusion.
              </p>
              <p className="mb-3">
                Our mission is to make it easier for families, individuals, and communities to discover sensory-friendly
                spaces — places that feel welcoming, supportive, and inclusive for everyone.
              </p>
              <p className="mb-3">
                From peaceful restaurants to inclusive events and calm play spaces, SensorySearch helps you find
                comfort, understanding, and belonging, one pin at a time.
              </p>
            </div>

            <p className="mb-8 text-xl font-semibold text-white drop-shadow-lg">
              Together, we can help make every community more inclusive.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" onClick={nextSlide} className="bg-white text-primary hover:bg-white/90 shadow-xl">
                Next
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            <div className="h-2 w-2 rounded-full bg-white/40" />
            <div className="h-2 w-8 rounded-full bg-white" />
            <div className="h-2 w-2 rounded-full bg-white/40" />
          </div>
        </div>
      </div>

      <div
        className={`absolute inset-0 transition-all duration-700 ease-in-out ${
          currentSlide === 2 ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }`}
      >
        <div className="flex h-full flex-col items-center justify-center px-6 overflow-y-auto py-12">
          <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
            <h2 className="mb-2 text-2xl font-heading font-bold text-foreground text-center">
              {authMode === "signup" ? "Create your account" : "Welcome back"}
            </h2>
            <p className="mb-6 text-sm text-muted-foreground text-center">
              {authMode === "signup"
                ? "Save favorites, set your radius, and submit events & venues."
                : "Sign in to access your saved favorites and submissions."}
            </p>

            <div className="space-y-3 mb-4">
              {GOOGLE_LOGIN_ENABLED && (
                <Button
                  variant="outline"
                  onClick={() => handleOAuthSignIn("google")}
                  disabled={isLoading}
                  className="w-full"
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
                    />
                  </svg>
                  Continue with Google
                </Button>
              )}

              {APPLE_LOGIN_ENABLED && (
                <Button
                  variant="outline"
                  onClick={() => handleOAuthSignIn("apple")}
                  disabled={isLoading}
                  className="w-full"
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-2.08-1.92-3.28-4.74-3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                  Continue with Apple
                </Button>
              )}
            </div>

            {(GOOGLE_LOGIN_ENABLED || APPLE_LOGIN_ENABLED) && (
              <div className="relative mb-4">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-muted-foreground">
                  or
                </span>
              </div>
            )}

            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={6}
                />
                {authMode === "signup" && (
                  <p className="mt-1 text-xs text-muted-foreground">Must be at least 6 characters</p>
                )}
              </div>

              {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Please wait..." : authMode === "signup" ? "Create account" : "Sign in"}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === "signup" ? "signin" : "signup")
                    setError("")
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground underline"
                  disabled={isLoading}
                >
                  {authMode === "signup" ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                </button>
              </div>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              By continuing you agree to our{" "}
              <Link href="/legal/terms" className="underline hover:text-foreground">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/legal/privacy" className="underline hover:text-foreground">
                Privacy Policy
              </Link>
              .
            </p>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            <div className="h-2 w-2 rounded-full bg-white/40" />
            <div className="h-2 w-2 rounded-full bg-white/40" />
            <div className="h-2 w-8 rounded-full bg-white" />
          </div>
        </div>
      </div>
    </div>
  )
}
