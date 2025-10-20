"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CreditCard,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Settings,
  Sparkles,
  Star,
  Bell,
  Plus,
  BarChart3,
  Eye,
  Heart,
  Download,
  TrendingUp,
  Copy,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  Building2,
  Loader2,
} from "lucide-react"
import { getCurrentUser, hasRole } from "@/lib/auth-utils"
import { useRouter } from "next/navigation"
import type { UserProfile } from "@/lib/mock-data"
import { mockEvents, filterActiveEvents, filterPastEvents } from "@/lib/mock-data"
import { getBusinessAnalytics, downloadAnalyticsCSV } from "@/lib/analytics"
import { useToast } from "@/hooks/use-toast"

interface Subscription {
  id: string
  businessName: string
  email: string
  tier: "basic" | "featured" | "premium"
  monthlyPrice: number
  status: "active" | "cancelled" | "past_due"
  startDate: string
  nextBillingDate: string
  paymentMethod: string
}

export default function BusinessAccountPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isBusinessAccount, setIsBusinessAccount] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const tierInfo = {
    basic: { name: "Basic Listing", icon: Sparkles, color: "text-blue-500" },
    featured: { name: "Featured Listing", icon: Star, color: "text-amber-500" },
    premium: { name: "Premium + Push", icon: Bell, color: "text-purple-500" },
  }

  useEffect(() => {
    const checkAuth = async () => {
      console.log("[v0] ORGANIZER_DASH_LOAD_START - Checking organizer access")

      const currentUser = getCurrentUser()
      console.log("[v0] Current user", { user: currentUser })

      const isAuthorized = hasRole("organizer")
      console.log("[v0] Authorization check", { isAuthorized, currentUser })

      if (!isAuthorized) {
        console.log("[v0] ORGANIZER_ACCESS_DENIED - Redirecting to upgrade")
        toast({
          title: "Organizer Account Required",
          description: "Create an Organizer account to continue.",
          variant: "destructive",
        })

        await new Promise((resolve) => setTimeout(resolve, 500))
        router.push("/upgrade-organizer")
        return
      }

      // Load profile
      const savedProfile = localStorage.getItem("userProfile")
      if (savedProfile) {
        const profile: UserProfile = JSON.parse(savedProfile)
        setUserProfile(profile)
        setIsBusinessAccount(true)
        console.log("[v0] Loaded organizer profile", { profile })
      }

      // Load subscriptions
      const stored = localStorage.getItem("subscriptions")
      if (stored) {
        setSubscriptions(JSON.parse(stored))
      }

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

  const handleCancelSubscription = (id: string) => {
    console.log("[v0] SUBSCRIPTION_CANCEL - Cancelling subscription", { id })
    const updated = subscriptions.map((sub) => (sub.id === id ? { ...sub, status: "cancelled" as const } : sub))
    setSubscriptions(updated)
    localStorage.setItem("subscriptions", JSON.stringify(updated))
    setShowCancelConfirm(null)
  }

  const handleReactivate = (id: string) => {
    console.log("[v0] SUBSCRIPTION_REACTIVATE - Reactivating subscription", { id })
    const updated = subscriptions.map((sub) => (sub.id === id ? { ...sub, status: "active" as const } : sub))
    setSubscriptions(updated)
    localStorage.setItem("subscriptions", JSON.stringify(updated))
  }

  const handleExportAnalytics = () => {
    console.log("[v0] ANALYTICS_EXPORT - Exporting analytics CSV")
    if (userProfile?.email) {
      downloadAnalyticsCSV(userProfile.email, `analytics-${new Date().toISOString().split("T")[0]}.csv`)
    }
  }

  const handleDuplicateEvent = (eventId: string) => {
    console.log("[v0] EVENT_DUPLICATE - Duplicating event", { eventId })
    router.push(`/advertise?duplicate=${eventId}`)
  }

  const handleDeleteEvent = (eventId: string) => {
    console.log("[v0] EVENT_DELETE - Deleting event", { eventId })
    alert(`Event ${eventId} would be deleted in production`)
  }

  if (userProfile && !isBusinessAccount) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="mx-auto max-w-2xl border-destructive/20">
          <CardContent className="flex flex-col items-center gap-6 p-12 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-foreground">Business Account Required</h2>
              <p className="text-lg text-muted-foreground">
                You need a business account to access this page. Upgrade your account to start submitting events.
              </p>
            </div>
            <Button asChild size="lg">
              <a href="/profile">Go to Profile</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const showPaymentReminder = isBusinessAccount && userProfile && !userProfile.has_payment_method_on_file

  const businessAnalytics = userProfile?.email ? getBusinessAnalytics(userProfile.email) : null
  const allBusinessEvents = userProfile?.email
    ? mockEvents.filter((event) => event.businessEmail === userProfile.email)
    : []
  const activeBusinessEvents = filterActiveEvents(allBusinessEvents)
  const pastBusinessEvents = filterPastEvents(allBusinessEvents)

  if (subscriptions.length === 0 && !isBusinessAccount) {
    return (
      <div className="container mx-auto px-4 py-16">
        {showPaymentReminder && (
          <Card className="mx-auto max-w-2xl mb-6 border-amber-500/20 bg-amber-500/5">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <p className="text-sm text-muted-foreground">Add a payment method to start submitting events</p>
            </CardContent>
          </Card>
        )}

        <Card className="mx-auto max-w-2xl">
          <CardContent className="flex flex-col items-center gap-6 p-12 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <CreditCard className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-foreground">No Active Subscriptions</h2>
              <p className="text-lg text-muted-foreground">
                You don't have any active subscriptions yet. Start promoting your events today!
              </p>
            </div>
            {isBusinessAccount && (
              <Button asChild size="lg" className="gap-2">
                <a href="/advertise">
                  <Plus className="h-5 w-5" />
                  Submit Your First Event
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        {/* Changed from "Business Account" to "Organizer Account" */}
        <h1 className="mb-2 text-4xl font-bold tracking-tight text-foreground">Organizer Account</h1>
        {/* Changed description to include venues */}
        <p className="text-lg text-muted-foreground">Manage your venues, events, billing, and analytics</p>
      </div>

      {showPaymentReminder && (
        <Card className="mb-6 border-amber-500/20 bg-amber-500/5">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <p className="text-sm text-muted-foreground">Add a payment method to continue submitting events</p>
          </CardContent>
        </Card>
      )}

      {/* Changed Tabs defaultValue from "subscriptions" to "venues" */}
      <Tabs defaultValue="venues" className="space-y-6">
        {/* Changed TabsList to include Venues and Events tabs */}
        <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3">
          {/* Added Venues tab */}
          <TabsTrigger value="venues" className="gap-2">
            <Building2 className="h-4 w-4" />
            Venues
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-2">
            <Calendar className="h-4 w-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Added Venues TabsContent */}
        <TabsContent value="venues" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Venue Subscriptions</CardTitle>
                  <CardDescription>Recurring monthly listings displayed 24/7</CardDescription>
                </div>
                <Button asChild className="gap-2">
                  <a href="/advertise">
                    <Plus className="h-5 w-5" />
                    Add Venue
                  </a>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {subscriptions.length === 0 ? (
                <div className="flex flex-col items-center gap-6 p-12 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <Building2 className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">No Active Venues</h2>
                    <p className="text-muted-foreground">
                      You don't have any venue subscriptions yet. Add your first venue to get started!
                    </p>
                  </div>
                  <Button asChild size="lg" className="gap-2">
                    <a href="/advertise">
                      <Plus className="h-5 w-5" />
                      Add Your First Venue
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {subscriptions.map((subscription) => {
                    const tier = tierInfo[subscription.tier]
                    const TierIcon = tier.icon
                    return (
                      <Card key={subscription.id} className={subscription.status === "cancelled" ? "opacity-60" : ""}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-2xl">{subscription.businessName}</CardTitle>
                              <CardDescription className="flex items-center gap-2">
                                <span>{subscription.email}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <TierIcon className={`h-3 w-3 ${tier.color}`} />
                                  {tier.name}
                                </span>
                              </CardDescription>
                            </div>
                            <Badge
                              variant={
                                subscription.status === "active"
                                  ? "default"
                                  : subscription.status === "cancelled"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {subscription.status === "active" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                              {subscription.status === "cancelled" && <XCircle className="mr-1 h-3 w-3" />}
                              {subscription.status === "past_due" && <AlertCircle className="mr-1 h-3 w-3" />}
                              {subscription.status.replace("_", " ").toUpperCase()}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid gap-6 md:grid-cols-2">
                            <Card>
                              <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                  Subscription Details
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-muted-foreground">Monthly Cost</span>
                                  <span className="text-2xl font-bold text-primary">
                                    ${subscription.monthlyPrice.toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">Started</span>
                                  <span className="font-medium">
                                    {new Date(subscription.startDate).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </span>
                                </div>
                                {subscription.status === "active" && (
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Next Billing</span>
                                    <span className="font-medium">
                                      {new Date(subscription.nextBillingDate).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })}
                                    </span>
                                  </div>
                                )}
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                  Payment Method
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                    <CreditCard className="h-5 w-5 text-primary" />
                                  </div>
                                  <div>
                                    <p className="font-medium">•••• •••• •••• 4242</p>
                                    <p className="text-sm text-muted-foreground">Expires 12/2027</p>
                                  </div>
                                </div>
                                <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent">
                                  <Settings className="h-4 w-4" />
                                  Update Payment Method
                                </Button>
                              </CardContent>
                            </Card>
                          </div>

                          <div className="flex gap-3">
                            {subscription.status === "active" ? (
                              <>
                                <Button variant="outline" className="gap-2 bg-transparent">
                                  <Settings className="h-4 w-4" />
                                  Manage Locations
                                </Button>
                                {showCancelConfirm === subscription.id ? (
                                  <div className="flex flex-1 gap-2">
                                    <Button
                                      variant="destructive"
                                      className="flex-1"
                                      onClick={() => handleCancelSubscription(subscription.id)}
                                    >
                                      Confirm Cancellation
                                    </Button>
                                    <Button variant="outline" onClick={() => setShowCancelConfirm(null)}>
                                      Keep Subscription
                                    </Button>
                                  </div>
                                ) : (
                                  <Button variant="outline" onClick={() => setShowCancelConfirm(subscription.id)}>
                                    Cancel Subscription
                                  </Button>
                                )}
                              </>
                            ) : subscription.status === "cancelled" ? (
                              <Button onClick={() => handleReactivate(subscription.id)} className="gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                Reactivate Subscription
                              </Button>
                            ) : null}
                          </div>

                          {subscription.status === "cancelled" && (
                            <div className="rounded-lg border border-border bg-muted/30 p-4">
                              <p className="text-sm text-muted-foreground">
                                Your subscription has been cancelled. You'll continue to have access until{" "}
                                {new Date(subscription.nextBillingDate).toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                                .
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Replaced original Subscriptions Tab with Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <Tabs defaultValue="active" className="space-y-6">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="active">Active Events ({activeBusinessEvents.length})</TabsTrigger>
              <TabsTrigger value="past">Past Events ({pastBusinessEvents.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Active Events</CardTitle>
                      <CardDescription>One-time purchases displayed until event end date</CardDescription>
                    </div>
                    <Button asChild className="gap-2">
                      <a href="/advertise">
                        <Plus className="h-5 w-5" />
                        Add Event
                      </a>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {activeBusinessEvents.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {activeBusinessEvents.map((event) => {
                        const analytics = businessAnalytics?.events[event.id]
                        const views = analytics?.views || 0
                        const favorites = analytics?.favorites || 0

                        return (
                          <Card key={event.id} className="flex flex-col">
                            <div className="relative aspect-video overflow-hidden rounded-t-lg">
                              <img
                                src={
                                  event.imageUrl ||
                                  "/placeholder.svg?height=200&width=400&query=sensory-friendly-event" ||
                                  "/placeholder.svg" ||
                                  "/placeholder.svg" ||
                                  "/placeholder.svg" ||
                                  "/placeholder.svg"
                                }
                                alt={event.name}
                                className="h-full w-full object-cover"
                              />
                              {event.featured && (
                                <Badge className="absolute right-3 top-3 bg-amber-500 gap-1">
                                  <Star className="h-3 w-3" />
                                  Featured
                                </Badge>
                              )}
                            </div>
                            <CardHeader>
                              <CardTitle className="text-lg text-balance">{event.name}</CardTitle>
                              <CardDescription className="space-y-1">
                                <div className="flex items-center gap-1 text-sm">
                                  <MapPin className="h-3 w-3" />
                                  {event.venueName}
                                </div>
                                <div className="flex items-center gap-1 text-sm">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(event.date).toLocaleDateString("en-US", {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </div>
                                <div className="flex items-center gap-1 text-sm">
                                  <Clock className="h-3 w-3" />
                                  {event.time}
                                </div>
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4">
                              <div className="flex gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">{views}</span>
                                  <span className="text-muted-foreground">views</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Heart className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">{favorites}</span>
                                  <span className="text-muted-foreground">favorites</span>
                                </div>
                              </div>

                              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                                <div className="flex justify-between mb-1">
                                  <span className="text-muted-foreground">Purchase Type</span>
                                  <span className="font-medium">
                                    {event.featured ? "Featured ($19.99)" : "Basic ($9.99)"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Status</span>
                                  <Badge variant="secondary" className="gap-1">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Active
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-6 p-12 text-center">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                        <Calendar className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-foreground">No Active Events</h2>
                        <p className="text-muted-foreground">
                          You don't have any active events yet. Submit your first event to get started!
                        </p>
                      </div>
                      <Button asChild size="lg" className="gap-2">
                        <a href="/advertise">
                          <Plus className="h-5 w-5" />
                          Submit Your First Event
                        </a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Past Events</CardTitle>
                  <CardDescription>
                    Events that have already occurred. Duplicate to create a new listing or delete permanently.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pastBusinessEvents.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {pastBusinessEvents.map((event) => {
                        const analytics = businessAnalytics?.events[event.id]
                        const views = analytics?.views || 0
                        const favorites = analytics?.favorites || 0

                        return (
                          <Card key={event.id} className="flex flex-col">
                            <div className="relative aspect-video overflow-hidden rounded-t-lg">
                              <img
                                src={
                                  event.imageUrl ||
                                  "/placeholder.svg?height=200&width=400&query=sensory-friendly-event" ||
                                  "/placeholder.svg" ||
                                  "/placeholder.svg" ||
                                  "/placeholder.svg" ||
                                  "/placeholder.svg"
                                }
                                alt={event.name}
                                className="h-full w-full object-cover opacity-75"
                              />
                              <Badge className="absolute right-3 top-3 bg-muted text-muted-foreground">Expired</Badge>
                            </div>
                            <CardHeader>
                              <CardTitle className="text-lg text-balance">{event.name}</CardTitle>
                              <CardDescription className="space-y-1">
                                <div className="flex items-center gap-1 text-sm">
                                  <MapPin className="h-3 w-3" />
                                  {event.venueName}
                                </div>
                                <div className="flex items-center gap-1 text-sm">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(event.date).toLocaleDateString("en-US", {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </div>
                                <div className="flex items-center gap-1 text-sm">
                                  <Clock className="h-3 w-3" />
                                  {event.time}
                                </div>
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4">
                              <div className="flex gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">{views}</span>
                                  <span className="text-muted-foreground">views</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Heart className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">{favorites}</span>
                                  <span className="text-muted-foreground">favorites</span>
                                </div>
                              </div>

                              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Purchase Type</span>
                                  <span className="font-medium">
                                    {event.featured ? "Featured ($19.99)" : "Basic ($9.99)"}
                                  </span>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  className="flex-1 gap-2 bg-transparent"
                                  onClick={() => handleDuplicateEvent(event.id)}
                                >
                                  <Copy className="h-4 w-4" />
                                  Duplicate
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="text-destructive hover:bg-destructive/10 bg-transparent"
                                  onClick={() => handleDeleteEvent(event.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Calendar className="h-12 w-12 text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">No past events</p>
                      <p className="text-sm text-muted-foreground">
                        Events that have passed their end date will appear here
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {businessAnalytics ? (
            <>
              <div className="grid gap-6 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{businessAnalytics.totalViews}</div>
                    <p className="text-xs text-muted-foreground mt-1">Across all events</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Favorites</CardTitle>
                    <Heart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{businessAnalytics.totalFavorites}</div>
                    <p className="text-xs text-muted-foreground mt-1">Users saved your events</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Events</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{activeBusinessEvents.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">Currently listed</p>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="active" className="space-y-6">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                  <TabsTrigger value="active">Active Events ({activeBusinessEvents.length})</TabsTrigger>
                  <TabsTrigger value="past">Past Events ({pastBusinessEvents.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Active Event Performance</CardTitle>
                          <CardDescription>Analytics for your upcoming events</CardDescription>
                        </div>
                        <Button onClick={handleExportAnalytics} variant="outline" className="gap-2 bg-transparent">
                          <Download className="h-4 w-4" />
                          Export CSV
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                                Event Name
                              </th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                              <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Views</th>
                              <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                                Favorites
                              </th>
                              <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">
                                Engagement
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {activeBusinessEvents.map((event) => {
                              const analytics = businessAnalytics.events[event.id]
                              const views = analytics?.views || 0
                              const favorites = analytics?.favorites || 0
                              const engagementRate = views > 0 ? ((favorites / views) * 100).toFixed(1) : "0.0"

                              return (
                                <tr key={event.id} className="border-b hover:bg-muted/50">
                                  <td className="py-3 px-4">
                                    <div className="font-medium">{event.name}</div>
                                    <div className="text-sm text-muted-foreground">{event.venueName}</div>
                                  </td>
                                  <td className="py-3 px-4 text-sm">
                                    {new Date(event.date).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <Badge variant="outline" className="gap-1">
                                      <Eye className="h-3 w-3" />
                                      {views}
                                    </Badge>
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <Badge variant="outline" className="gap-1">
                                      <Heart className="h-3 w-3" />
                                      {favorites}
                                    </Badge>
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <span className="text-sm font-medium">{engagementRate}%</span>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>

                      {activeBusinessEvents.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <BarChart3 className="h-12 w-12 text-muted-foreground mb-3" />
                          <p className="text-muted-foreground">No active events</p>
                          <p className="text-sm text-muted-foreground">Submit a new event to see it here</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="past" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Past Events</CardTitle>
                      <CardDescription>
                        Events that have already occurred. Duplicate to create a new listing or delete permanently.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {pastBusinessEvents.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {pastBusinessEvents.map((event) => {
                            const analytics = businessAnalytics.events[event.id]
                            const views = analytics?.views || 0
                            const favorites = analytics?.favorites || 0

                            return (
                              <Card key={event.id} className="flex flex-col">
                                <div className="relative aspect-video overflow-hidden rounded-t-lg">
                                  <img
                                    src={
                                      event.imageUrl ||
                                      "/placeholder.svg?height=200&width=400&query=sensory-friendly-event" ||
                                      "/placeholder.svg" ||
                                      "/placeholder.svg" ||
                                      "/placeholder.svg" ||
                                      "/placeholder.svg"
                                    }
                                    alt={event.name}
                                    className="h-full w-full object-cover opacity-75"
                                  />
                                  <Badge className="absolute right-3 top-3 bg-muted text-muted-foreground">
                                    Expired
                                  </Badge>
                                </div>
                                <CardHeader>
                                  <CardTitle className="text-lg text-balance">{event.name}</CardTitle>
                                  <CardDescription className="space-y-1">
                                    <div className="flex items-center gap-1 text-sm">
                                      <MapPin className="h-3 w-3" />
                                      {event.venueName}
                                    </div>
                                    <div className="flex items-center gap-1 text-sm">
                                      <Calendar className="h-3 w-3" />
                                      {new Date(event.date).toLocaleDateString("en-US", {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                      })}
                                    </div>
                                    <div className="flex items-center gap-1 text-sm">
                                      <Clock className="h-3 w-3" />
                                      {event.time}
                                    </div>
                                  </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-4">
                                  <div className="flex gap-4 text-sm">
                                    <div className="flex items-center gap-1">
                                      <Eye className="h-4 w-4 text-muted-foreground" />
                                      <span className="font-medium">{views}</span>
                                      <span className="text-muted-foreground">views</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Heart className="h-4 w-4 text-muted-foreground" />
                                      <span className="font-medium">{favorites}</span>
                                      <span className="text-muted-foreground">favorites</span>
                                    </div>
                                  </div>

                                  <div className="rounded-lg bg-muted/50 p-4">
                                    <p className="text-sm text-muted-foreground">
                                      Your subscription has been cancelled. You'll continue to have access until{" "}
                                      {new Date(event.date).toLocaleDateString("en-US", {
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                      })}
                                      .
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      className="flex-1 gap-2 bg-transparent"
                                      onClick={() => handleDuplicateEvent(event.id)}
                                    >
                                      <Copy className="h-4 w-4" />
                                      Duplicate
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="text-destructive hover:bg-destructive/10 bg-transparent"
                                      onClick={() => handleDeleteEvent(event.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <Calendar className="h-12 w-12 text-muted-foreground mb-3" />
                          <p className="text-muted-foreground">No past events</p>
                          <p className="text-sm text-muted-foreground">
                            Events that have passed their end date will appear here
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center gap-6 p-12 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <BarChart3 className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">No Analytics Data</h2>
                  <p className="text-muted-foreground">
                    Submit events and start tracking views and favorites to see your analytics here.
                  </p>
                </div>
                <Button asChild size="lg" className="gap-2">
                  <a href="/advertise">
                    <Plus className="h-5 w-5" />
                    Submit Your First Event
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
