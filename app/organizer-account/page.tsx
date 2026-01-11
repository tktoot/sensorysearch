"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Building2, Calendar, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

export default function OrganizerAccountPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isOrganizer, setIsOrganizer] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      console.log("[v0] ORGANIZER_DASH_LOAD_START - Checking organizer access")

      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        console.log("[v0] No auth session, redirecting to intro")
        router.push("/intro?next=/organizer-account")
        return
      }

      setUserEmail(session.user.email || null)

      const { data: userData } = await supabase.from("users").select("role").eq("id", session.user.id).single()
      const role = userData?.role || "user"
      const isAuth = role === "organizer" || role === "admin"

      console.log("[v0] User role:", role, "isOrganizer:", isAuth)

      if (!isAuth) {
        console.log("[v0] ORGANIZER_ACCESS_DENIED - Redirecting to upgrade")
        toast({
          title: "Organizer Account Required",
          description: "Create an Organizer account to continue.",
          variant: "destructive",
        })

        await new Promise((resolve) => setTimeout(resolve, 500))
        router.push("/upgrade-organizer?next=/organizer-account")
        return
      }

      setIsOrganizer(true)
      console.log("[v0] ORGANIZER_DASH_LOADED - Dashboard ready")
      setIsLoading(false)
    }

    checkAuth()
  }, [router, toast])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="mx-auto max-w-2xl">
          <CardContent className="flex flex-col items-center gap-6 p-12 text-center">
            <div className="flex h-20 w-20 items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isOrganizer) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="mx-auto max-w-2xl border-destructive/20">
          <CardContent className="flex flex-col items-center gap-6 p-12 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-foreground">Organizer Account Required</h2>
              <p className="text-lg text-muted-foreground">You need an organizer account to access this page.</p>
            </div>
            <Button asChild size="lg">
              <a href="/upgrade-organizer?next=/organizer-account">Create Organizer Account</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold tracking-tight text-foreground">Organizer Account</h1>
        <p className="text-lg text-muted-foreground">Manage your venues, events, and submissions</p>
      </div>

      <Tabs defaultValue="submissions" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-2">
          <TabsTrigger value="submissions" className="gap-2">
            <Calendar className="h-4 w-4" />
            My Submissions
          </TabsTrigger>
          <TabsTrigger value="venues" className="gap-2">
            <Building2 className="h-4 w-4" />
            Submit New
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Submissions</CardTitle>
              <CardDescription>View and manage your submitted listings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-6 p-12 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <Calendar className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">No Submissions Yet</h2>
                  <p className="text-muted-foreground">Submit your first venue or event to get started!</p>
                </div>
                <Button asChild size="lg">
                  <a href="/submit">Submit Your First Listing</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="venues" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submit a New Listing</CardTitle>
              <CardDescription>Choose what type of listing you want to create</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="group cursor-pointer transition-all hover:border-primary hover:shadow-lg">
                  <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                    <Building2 className="h-12 w-12 text-primary" />
                    <div>
                      <h3 className="text-lg font-semibold">Venue</h3>
                      <p className="text-sm text-muted-foreground">Add a sensory-friendly business</p>
                    </div>
                    <Button asChild className="w-full">
                      <a href="/organizer/submit/venue">Submit Venue</a>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="group cursor-pointer transition-all hover:border-primary hover:shadow-lg">
                  <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                    <Calendar className="h-12 w-12 text-primary" />
                    <div>
                      <h3 className="text-lg font-semibold">Event</h3>
                      <p className="text-sm text-muted-foreground">Share a sensory-friendly event</p>
                    </div>
                    <Button asChild className="w-full">
                      <a href="/organizer/submit/event">Submit Event</a>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
