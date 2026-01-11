"use client"
import ProfileDetailsDrawer from "@/components/profile-details-drawer" // Import ProfileDetailsDrawer

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Heart, Calendar, Briefcase, ArrowRight, Shield, LogOut } from "lucide-react"
import { ProfileBanner } from "@/components/profile-banner"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import type { Profile } from "@/lib/profile-helpers"

function ProfilePageContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [showProfileDrawer, setShowProfileDrawer] = useState(false)
  const [favoriteCount, setFavoriteCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<string>("user")
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    console.log("[v0] PROFILE_LOAD_START - Loading profile page")

    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        setIsAuthenticated(true)
        setUserEmail(session.user.email || null)

        const { data: userData } = await supabase.from("users").select("role").eq("id", session.user.id).single()
        const role = userData?.role || "user"
        setUserRole(role)
        console.log("[v0] Current user role:", role)

        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

        if (profileData) {
          console.log("[v0] Loaded profile from database", { profile: profileData })
          setProfile(profileData)
        } else {
          console.log("[v0] No profile found for user")
          setProfile(null)
        }

        const { count } = await supabase
          .from("favorites")
          .select("*", { count: "exact", head: true })
          .eq("user_id", session.user.id)

        setFavoriteCount(count || 0)
        console.log("[v0] Loaded favorite count:", count)
      } else {
        console.log("[v0] No auth session, redirecting to intro")
        router.push("/intro?next=/profile")
        return
      }

      console.log("[v0] PROFILE_LOAD_OK - Profile loaded successfully")
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

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

        setUserRole("organizer")

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
      router.push("/intro")
    }
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

  const firstName = "Friend"
  const initials = userEmail ? userEmail[0].toUpperCase() : "U"

  const isOrganizer = userRole === "organizer" || userRole === "admin"

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
                {userRole === "admin" && (
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
                    <p className="text-xs text-muted-foreground">Your saved items</p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-sm font-semibold">
                    {favoriteCount}
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
                    <h3 className="text-sm font-semibold text-foreground">Upcoming Events</h3>
                    <p className="text-xs text-muted-foreground">Browse events</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tools</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {isOrganizer ? (
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 flex-1 text-xs"
                      onClick={(e) => {
                        e.preventDefault()
                        router.push("/submit")
                      }}
                    >
                      Submit
                    </Button>
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
      </div>

      <ProfileDetailsDrawer
        open={showProfileDrawer}
        onOpenChange={setShowProfileDrawer}
        profile={profile}
        onProfileUpdate={(updatedProfile) => {
          setProfile(updatedProfile)
          setShowProfileDrawer(false)
        }}
      />
    </div>
  )
}

export default function ProfilePage() {
  return <ProfilePageContent />
}
