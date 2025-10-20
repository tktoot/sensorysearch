"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Heart,
  Calendar,
  MapPin,
  Briefcase,
  ArrowRight,
  Star,
  Music,
  Building,
  Palette,
  Shield,
  LogOut,
} from "lucide-react"
import { mockVenues, mockEvents, type UserProfile, type Event } from "@/lib/mock-data"
import { ProfileOnboarding } from "@/components/profile-onboarding"
import { ProfileBanner } from "@/components/profile-banner"
import { ProfileDetailsDrawer } from "@/components/profile-details-drawer"
import { ProfileErrorBoundary } from "@/components/profile-error-boundary"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getUserFavorites } from "@/lib/user-utils"
import { BILLING_ENABLED } from "@/lib/config"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import type { UserRole } from "@/lib/types"

function ProfilePageContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showProfileDrawer, setShowProfileDrawer] = useState(false)
  const [favoriteEvents, setFavoriteEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    console.log("[v0] PROFILE_LOAD_START - Loading profile page")

    try {
      const checkAuth = async () => {
        const supabase = createClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          setIsAuthenticated(true)

          const { data: userData } = await supabase.from("users").select("role").eq("id", session.user.id).single()

          const currentUser = {
            ...session.user,
            role: userData?.role || "user",
          }

          console.log("[v0] Current user from auth", { user: currentUser })

          const savedProfile = localStorage.getItem("userProfile")

          if (savedProfile) {
            const profile = JSON.parse(savedProfile)
            console.log("[v0] Loaded profile from localStorage", { profile })
            setUserProfile({ ...profile, role: currentUser.role })

            if (!profile.name || !profile.email || !profile.agePreference) {
              console.log("[v0] Profile incomplete, showing onboarding")
              setShowOnboarding(true)
            }
          } else {
            console.log("[v0] No saved profile, showing onboarding")
            setShowOnboarding(true)
            setUserProfile({
              agePreference: null,
              role: currentUser.role,
            })
          }
        } else {
          const savedProfile = localStorage.getItem("userProfile")
          if (savedProfile) {
            const profile = JSON.parse(savedProfile)
            setUserProfile(profile)
          } else {
            setUserProfile({
              agePreference: null,
              role: "user",
            })
            setShowOnboarding(true)
          }
        }

        try {
          const favorites = getUserFavorites()
          const eventIds = favorites.map((f) => f.eventId)
          const events = mockEvents.filter((event) => eventIds.includes(event.id))
          setFavoriteEvents(events)
          console.log("[v0] Loaded favorite events", { count: events.length })
        } catch (error) {
          console.error("[v0] Failed to load favorites", error)
          setFavoriteEvents([])
        }

        console.log("[v0] PROFILE_LOAD_OK - Profile loaded successfully")
      }

      checkAuth()
    } catch (error) {
      console.error("[v0] PROFILE_LOAD_ERROR - Failed to load profile", error)
      setUserProfile({
        agePreference: null,
        role: "user",
      })
      setShowOnboarding(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleOnboardingComplete = (profile: UserProfile) => {
    console.log("[v0] Onboarding completed", { profile })
    const completeProfile = { ...profile, role: userProfile?.role || "user" }
    setUserProfile(completeProfile)
    localStorage.setItem("userProfile", JSON.stringify(completeProfile))
    setShowOnboarding(false)
    localStorage.removeItem("profileBannerDismissed")
  }

  const handleUpgradeClick = async () => {
    console.log("[v0] CLICK_UPGRADE - User clicked upgrade to organizer")

    if (isAuthenticated) {
      try {
        const response = await fetch("/api/upgrade-organizer", {
          method: "POST",
        })

        if (!response.ok) {
          throw new Error("Upgrade failed")
        }

        const data = await response.json()

        toast({
          title: "Upgraded to Organizer!",
          description: `You now have access to organizer tools. Your 3-month free trial ends ${new Date(data.trialEndsAt).toLocaleDateString()}.`,
        })

        // Update local state
        if (userProfile) {
          const updatedProfile = { ...userProfile, role: "organizer" as UserRole }
          setUserProfile(updatedProfile)
          localStorage.setItem("userProfile", JSON.stringify(updatedProfile))
        }

        // Redirect to submit page
        router.push("/submit")
      } catch (error) {
        console.error("[v0] Upgrade error:", error)
        toast({
          title: "Upgrade Failed",
          description: "Please try again later",
          variant: "destructive",
        })
      }
    } else {
      // Not authenticated, go to sign in
      router.push("/intro")
    }
  }

  const handleManageSubscription = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("[v0] CLICK_MANAGE_SUB - User clicked manage subscription")
    router.push("/billing/manage")
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("[v0] SIGN_OUT_ERROR", error)
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      })
    } else {
      console.log("[v0] SIGN_OUT_SUCCESS")
      toast({
        title: "Signed out",
        description: "You've been signed out successfully",
      })
      setIsAuthenticated(false)
      router.push("/discover")
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    )
  }

  if (!userProfile) {
    console.error("[v0] PROFILE_LOAD_ERROR - userProfile is null after loading")
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="mx-auto max-w-2xl">
          <CardContent className="flex flex-col items-center gap-6 p-12 text-center">
            <p className="text-muted-foreground">Unable to load profile. Please refresh the page.</p>
            <Button onClick={() => window.location.reload()}>Refresh</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const firstName = userProfile.name?.split(" ")[0] || "Friend"

  const initials = userProfile.name
    ? userProfile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U"

  const savedVenues = mockVenues.slice(0, 3)
  const upcomingEvents = mockEvents.slice(0, 2)
  const isBusinessAccount = userProfile.role === "business" || userProfile.role === "organizer"

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "museum":
        return <Building className="h-4 w-4" />
      case "music":
        return <Music className="h-4 w-4" />
      case "art":
        return <Palette className="h-4 w-4" />
      default:
        return <Star className="h-4 w-4" />
    }
  }

  if (showOnboarding) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ProfileOnboarding onComplete={handleOnboardingComplete} initialProfile={userProfile} />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-background to-muted/20">
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-br from-teal-50 via-purple-50 to-orange-50 dark:from-teal-950/20 dark:via-purple-950/20 dark:to-orange-950/20" />

      <div className="container relative mx-auto px-4 py-6">
        <ProfileBanner />

        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-600 text-lg font-bold text-white shadow-md">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-gradient">Welcome back, {firstName}!</h1>
                {userProfile.role === "admin" && (
                  <Badge
                    variant="secondary"
                    className="gap-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                  >
                    <Shield className="h-3 w-3" />
                    Admin
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="link"
                  className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => setShowProfileDrawer(true)}
                >
                  Edit Profile <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
                {isAuthenticated && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <Button
                      variant="link"
                      className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-1 h-3 w-3" />
                      Sign Out
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your Activity</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/favorites">
              <Card className="group h-full cursor-pointer rounded-lg border border-teal-200/50 bg-gradient-to-br from-teal-50/80 to-teal-100/30 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md dark:border-teal-900/30 dark:from-teal-950/20 dark:to-teal-950/10">
                <CardContent className="flex items-center gap-3 p-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-500 shadow-sm">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground">Favorites</h3>
                    <p className="text-xs text-muted-foreground">Your saved events</p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-sm font-semibold">
                    {favoriteEvents.length}
                  </Badge>
                </CardContent>
              </Card>
            </Link>

            <Link href="/events">
              <Card className="group h-full cursor-pointer rounded-lg border border-orange-200/50 bg-gradient-to-br from-orange-50/80 to-orange-100/30 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md dark:border-orange-900/30 dark:from-orange-950/20 dark:to-orange-950/10">
                <CardContent className="flex items-center gap-3 p-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500 shadow-sm">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground">My Events</h3>
                    <p className="text-xs text-muted-foreground">Upcoming activities</p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-sm font-semibold">
                    {upcomingEvents.length}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tools</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {isBusinessAccount ? (
              <Card className="group h-full cursor-pointer rounded-lg border border-green-200/50 bg-gradient-to-br from-green-50/80 to-green-100/30 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md dark:border-green-900/30 dark:from-green-950/20 dark:to-green-950/10">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-500 shadow-sm">
                      <Briefcase className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground">Organizer Tools</h3>
                      <p className="text-xs text-muted-foreground">Manage your listings</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 flex-1 text-xs"
                      onClick={(e) => {
                        e.preventDefault()
                        router.push("/organizer-account")
                      }}
                    >
                      Dashboard
                    </Button>
                    {BILLING_ENABLED && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 flex-1 text-xs"
                        onClick={(e) => {
                          e.preventDefault()
                          handleManageSubscription(e)
                        }}
                      >
                        Subscription
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card
                className="group h-full cursor-pointer rounded-lg border border-green-200/50 bg-gradient-to-br from-green-50/80 to-green-100/30 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md dark:border-green-900/30 dark:from-green-950/20 dark:to-green-950/10"
                onClick={handleUpgradeClick}
              >
                <CardContent className="flex items-center gap-3 p-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-500 shadow-sm">
                    <Briefcase className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground">Organizer Tools</h3>
                    <p className="text-xs text-muted-foreground">List your venue or event</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {favoriteEvents.length > 0 && (
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gradient">Saved Events</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/favorites" className="text-sm">
                  View All <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {favoriteEvents.slice(0, 3).map((event) => (
                <Link key={event.id} href={`/event/${event.id}`}>
                  <Card className="group overflow-hidden rounded-xl transition-all hover:shadow-md">
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={event.imageUrl || "/placeholder.svg?height=200&width=400&query=sensory-friendly-event"}
                        alt={event.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md">
                        {getCategoryIcon(event.category)}
                      </div>
                    </div>
                    <CardHeader className="p-4">
                      <CardTitle className="line-clamp-1 text-base">{event.name}</CardTitle>
                      <CardDescription className="space-y-0.5 text-xs">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.venueName}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(event.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {savedVenues.length > 0 && (
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gradient">Saved Venues</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/" className="text-sm">
                  View All <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {savedVenues.map((venue) => (
                <Link key={venue.id} href={`/venues/${venue.id}`}>
                  <Card className="group overflow-hidden rounded-xl transition-all hover:shadow-md">
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={venue.imageUrl || "/placeholder.svg?height=200&width=400&query=sensory-friendly-venue"}
                        alt={venue.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md">
                        <Building className="h-4 w-4" />
                      </div>
                    </div>
                    <CardHeader className="p-4">
                      <CardTitle className="line-clamp-1 text-base">{venue.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 text-xs">
                        <MapPin className="h-3 w-3" />
                        {venue.city}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {favoriteEvents.length === 0 && savedVenues.length === 0 && (
          <Card className="border-dashed rounded-xl">
            <CardContent className="flex h-48 flex-col items-center justify-center gap-3 p-6">
              <Heart className="h-12 w-12 text-muted-foreground" />
              <p className="text-center text-base font-medium text-foreground">Start exploring!</p>
              <p className="text-center text-sm text-muted-foreground">
                Save your favorite events and venues to see them here
              </p>
              <Button asChild size="sm">
                <Link href="/discover">Discover Events</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <ProfileDetailsDrawer
        open={showProfileDrawer}
        onOpenChange={setShowProfileDrawer}
        profile={userProfile}
        onEdit={() => {
          setShowProfileDrawer(false)
          setShowOnboarding(true)
        }}
      />
    </div>
  )
}

export default function ProfilePage() {
  return (
    <ProfileErrorBoundary>
      <ProfilePageContent />
    </ProfileErrorBoundary>
  )
}
