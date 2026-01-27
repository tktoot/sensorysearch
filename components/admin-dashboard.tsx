"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import {
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  DollarSign,
  CreditCard,
  Sparkles,
  Star,
  Bell,
  Phone,
  Gift,
  Shield,
  Church,
  TreePine,
  Briefcase,
  Building2,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
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
  isFreeTrial?: boolean
  phoneVerified?: boolean
  phoneNumber?: string
}

export function AdminDashboard() {
  const { toast } = useToast()
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [venueCount, setVenueCount] = useState(0)
  const [eventCount, setEventCount] = useState(0)
  const [worshipCount, setWorshipCount] = useState(0)
  const [parksCount, setParksCount] = useState(0)
  const [professionalServicesCount, setProfessionalServicesCount] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const tierInfo = {
    basic: { name: "Basic", icon: Sparkles, color: "bg-blue-500/10 text-blue-500" },
    featured: { name: "Featured", icon: Star, color: "bg-amber-500/10 text-amber-500" },
    premium: { name: "Premium", icon: Bell, color: "bg-purple-500/10 text-purple-500" },
  }

  useEffect(() => {
    const stored = localStorage.getItem("subscriptions")
    if (stored) {
      setSubscriptions(JSON.parse(stored))
    }

    fetchSubmissions()
    fetchCounts()
  }, [])

  const fetchCounts = async () => {
    try {
      const supabase = createClient()

      const [venuesRes, eventsRes, worshipRes, parksRes, playgroundsRes, professionalRes] = await Promise.all([
        supabase.from("venues").select("*", { count: "exact", head: true }),
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase.from("places_of_worship").select("*", { count: "exact", head: true }),
        supabase.from("parks").select("*", { count: "exact", head: true }),
        supabase.from("playgrounds").select("*", { count: "exact", head: true }),
        supabase.from("professional_services").select("*", { count: "exact", head: true }),
      ])

      setVenueCount(venuesRes.count || 0)
      setEventCount(eventsRes.count || 0)
      setWorshipCount(worshipRes.count || 0)
      setParksCount((parksRes.count || 0) + (playgroundsRes.count || 0))
      setProfessionalServicesCount(professionalRes.count || 0)
    } catch (err) {
      console.error("[v0] Failed to fetch counts:", err)
    }
  }

  const fetchSubmissions = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("listings").select("*").order("submitted_at", { ascending: false })

      if (error) throw error

      setSubmissions(data || [])
    } catch (err) {
      console.error("[v0] Failed to fetch submissions:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (submissionId: string) => {
    setActionLoading(submissionId)
    try {
      const response = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: submissionId }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Approval Failed",
          description: data.error || data.details || "Unknown error occurred",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Submission Approved",
        description: "The listing is now live on the Discover page.",
      })

      await fetchSubmissions()
      await fetchCounts()
    } catch (err) {
      console.error("[v0] Approval error:", err)
      toast({
        title: "Approval Failed",
        description: err instanceof Error ? err.message : "Network error",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (submissionId: string, reason?: string) => {
    setActionLoading(submissionId)
    try {
      const response = await fetch("/api/admin/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: submissionId, reason }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Rejection Failed",
          description: data.error || data.details || "Unknown error occurred",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Submission Rejected",
        description: "The listing has been rejected.",
      })

      await fetchSubmissions()
    } catch (err) {
      console.error("[v0] Rejection error:", err)
      toast({
        title: "Rejection Failed",
        description: err instanceof Error ? err.message : "Network error",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleGrantTrial = (subscriptionId: string) => {
    const updated = subscriptions.map((sub) => (sub.id === subscriptionId ? { ...sub, isFreeTrial: true } : sub))
    setSubscriptions(updated)
    localStorage.setItem("subscriptions", JSON.stringify(updated))
  }

  const handleRevokeTrial = (subscriptionId: string) => {
    const updated = subscriptions.map((sub) => (sub.id === subscriptionId ? { ...sub, isFreeTrial: false } : sub))
    setSubscriptions(updated)
    localStorage.setItem("subscriptions", JSON.stringify(updated))
  }

  const stats = {
    totalVenues: venueCount,
    totalEvents: eventCount,
    totalWorship: worshipCount,
    totalParks: parksCount,
    totalProfessionalServices: professionalServicesCount,
    pendingSubmissions: submissions.filter((s) => s.status === "pending").length,
    approvedToday: submissions.filter(
      (s) =>
        s.status === "approved" &&
        s.reviewed_at &&
        new Date(s.reviewed_at).toDateString() === new Date().toDateString(),
    ).length,
    activeSubscribers: subscriptions.filter((s) => s.status === "active").length,
    monthlyRevenue: subscriptions.filter((s) => s.status === "active").reduce((sum, s) => sum + s.monthlyPrice, 0),
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage submissions, subscribers, and content</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Venues</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVenues}</div>
            <p className="text-xs text-muted-foreground">Active listings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">Upcoming events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscribers}</div>
            <p className="text-xs text-muted-foreground">Paying businesses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.monthlyRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Recurring revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="moderation" className="space-y-6">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="moderation" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            Queue
            {stats.pendingSubmissions > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 px-1.5">
                {stats.pendingSubmissions}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="subscribers" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Subs
          </TabsTrigger>
          <TabsTrigger value="venues" className="gap-2">
            <Building2 className="h-4 w-4" />
            Venues ({stats.totalVenues})
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-2">
            <Calendar className="h-4 w-4" />
            Events ({stats.totalEvents})
          </TabsTrigger>
          <TabsTrigger value="worship" className="gap-2">
            <Church className="h-4 w-4" />
            Worship ({stats.totalWorship})
          </TabsTrigger>
          <TabsTrigger value="parks" className="gap-2">
            <TreePine className="h-4 w-4" />
            Parks ({stats.totalParks})
          </TabsTrigger>
          <TabsTrigger value="services" className="gap-2">
            <Briefcase className="h-4 w-4" />
            Services ({stats.totalProfessionalServices})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="moderation" className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-2xl font-semibold">Pending Submissions</h2>
            <Badge variant="secondary">{stats.pendingSubmissions} pending</Badge>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
              className={selectedCategory !== "all" ? "bg-transparent" : ""}
            >
              All ({stats.pendingSubmissions})
            </Button>
            <Button
              variant={selectedCategory === "venue" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("venue")}
              className={selectedCategory !== "venue" ? "bg-transparent" : ""}
            >
              <Building2 className="mr-1 h-3 w-3" />
              Venues ({submissions.filter(s => s.status === "pending" && s.type === "venue").length})
            </Button>
            <Button
              variant={selectedCategory === "event" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("event")}
              className={selectedCategory !== "event" ? "bg-transparent" : ""}
            >
              <Calendar className="mr-1 h-3 w-3" />
              Events ({submissions.filter(s => s.status === "pending" && s.type === "event").length})
            </Button>
            <Button
              variant={selectedCategory === "place_of_worship" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("place_of_worship")}
              className={selectedCategory !== "place_of_worship" ? "bg-transparent" : ""}
            >
              <Church className="mr-1 h-3 w-3" />
              Worship ({submissions.filter(s => s.status === "pending" && s.type === "place_of_worship").length})
            </Button>
            <Button
              variant={selectedCategory === "park" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("park")}
              className={selectedCategory !== "park" ? "bg-transparent" : ""}
            >
              <TreePine className="mr-1 h-3 w-3" />
              Parks ({submissions.filter(s => s.status === "pending" && (s.type === "park" || s.type === "playground")).length})
            </Button>
            <Button
              variant={selectedCategory === "professional_service" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("professional_service")}
              className={selectedCategory !== "professional_service" ? "bg-transparent" : ""}
            >
              <Briefcase className="mr-1 h-3 w-3" />
              Services ({submissions.filter(s => s.status === "pending" && s.type === "professional_service").length})
            </Button>
          </div>

          {loading ? (
            <Card>
              <CardContent className="flex h-48 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {submissions
                .filter((s) => {
                  if (s.status !== "pending") return false
                  if (selectedCategory === "all") return true
                  if (selectedCategory === "park") return s.type === "park" || s.type === "playground"
                  return s.type === selectedCategory
                })
                .map((submission) => (
                  <Card key={submission.id} className="border-l-4 border-l-accent">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-xl">{submission.title}</CardTitle>
                          <CardDescription className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {submission.city}, {submission.state}
                            </span>
                            <span className="text-xs">
                              {new Date(submission.submitted_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </CardDescription>
                        </div>
                        <Badge>{submission.type}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {submission.images && submission.images.length > 0 && (
                        <div className="relative aspect-video overflow-hidden rounded-lg">
                          <img
                            src={submission.images[0] || "/placeholder.svg"}
                            alt={submission.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}

                      <p className="text-sm text-muted-foreground line-clamp-3">{submission.description}</p>

                      {submission.sensory_features && (
                        <div className="flex flex-wrap gap-2">
                          {typeof submission.sensory_features === 'object' && !Array.isArray(submission.sensory_features) ? (
                            <>
                              {submission.sensory_features.noiseLevel && (
                                <Badge variant="outline" className="text-xs">Noise: {submission.sensory_features.noiseLevel}</Badge>
                              )}
                              {submission.sensory_features.lightingLevel && (
                                <Badge variant="outline" className="text-xs">Lighting: {submission.sensory_features.lightingLevel}</Badge>
                              )}
                              {submission.sensory_features.crowdLevel && (
                                <Badge variant="outline" className="text-xs">Crowd: {submission.sensory_features.crowdLevel}</Badge>
                              )}
                              {submission.sensory_features.wheelchairAccessible && (
                                <Badge variant="outline" className="text-xs">Wheelchair Accessible</Badge>
                              )}
                              {submission.sensory_features.quietSpaceAvailable && (
                                <Badge variant="outline" className="text-xs">Quiet Space</Badge>
                              )}
                            </>
                          ) : Array.isArray(submission.sensory_features) && submission.sensory_features.map((feature: string) => (
                            <Badge key={feature} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(submission.id)}
                          disabled={actionLoading === submission.id}
                          className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading === submission.id ? (
                            <Loader2 className="mr-2 inline-block h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="mr-2 inline-block h-4 w-4" />
                          )}
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(submission.id)}
                          disabled={actionLoading === submission.id}
                          className="flex-1 rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading === submission.id ? (
                            <Loader2 className="mr-2 inline-block h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="mr-2 inline-block h-4 w-4" />
                          )}
                          Reject
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

              {stats.pendingSubmissions === 0 && (
                <Card>
                  <CardContent className="flex h-48 flex-col items-center justify-center gap-3 p-6">
                    <CheckCircle className="h-12 w-12 text-primary" />
                    <p className="text-center text-muted-foreground">
                      All caught up! No pending submissions to review.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="subscribers" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Active Subscribers</h2>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold text-primary">${stats.monthlyRevenue.toFixed(2)}</p>
              </div>
              <Badge variant="secondary">{stats.activeSubscribers} active</Badge>
            </div>
          </div>

          <div className="space-y-3">
            {subscriptions.map((subscription) => {
              const tier = tierInfo[subscription.tier]
              const TierIcon = tier.icon
              return (
                <Card key={subscription.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full ${
                            subscription.status === "active"
                              ? tier.color
                              : subscription.status === "cancelled"
                                ? "bg-muted text-muted-foreground"
                                : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          <TierIcon className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{subscription.businessName}</p>
                            {subscription.isFreeTrial && (
                              <Badge variant="secondary" className="gap-1">
                                <Gift className="h-3 w-3" />
                                Free Trial
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {subscription.email} • {tier.name} Tier
                          </p>
                          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                            {subscription.phoneVerified ? (
                              <span className="flex items-center gap-1 text-primary">
                                <Phone className="h-3 w-3" />
                                Verified
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                Not Verified
                              </span>
                            )}
                            {subscription.phoneNumber && <span>{subscription.phoneNumber}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">${subscription.monthlyPrice.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">per month</p>
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
                          {subscription.status === "active" && <CheckCircle className="mr-1 h-3 w-3" />}
                          {subscription.status === "cancelled" && <XCircle className="mr-1 h-3 w-3" />}
                          {subscription.status === "past_due" && <AlertCircle className="mr-1 h-3 w-3" />}
                          {subscription.status.replace("_", " ").toUpperCase()}
                        </Badge>
                        <div className="text-right text-sm">
                          <p className="text-muted-foreground">Next billing</p>
                          <p className="font-medium">
                            {new Date(subscription.nextBillingDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2 border-t border-border pt-4">
                      {subscription.isFreeTrial ? (
                        <Button variant="outline" size="sm" onClick={() => handleRevokeTrial(subscription.id)}>
                          <XCircle className="mr-1 h-3 w-3" />
                          Revoke Trial
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => handleGrantTrial(subscription.id)}>
                          <Gift className="mr-1 h-3 w-3" />
                          Grant Trial
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Shield className="mr-1 h-3 w-3" />
                        Whitelist Domain
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {subscriptions.length === 0 && (
              <Card>
                <CardContent className="flex h-48 flex-col items-center justify-center gap-3 p-6">
                  <CreditCard className="h-12 w-12 text-muted-foreground" />
                  <p className="text-center text-muted-foreground">No subscribers yet.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="venues" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">All Venues</h2>
            <Badge variant="secondary">{venueCount} total</Badge>
          </div>

          <Card>
            <CardContent className="flex h-48 flex-col items-center justify-center gap-3 p-6">
              <MapPin className="h-12 w-12 text-muted-foreground" />
              <p className="text-center text-muted-foreground">
                Venue management coming soon. Check the Discover page to see live venues.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">All Events</h2>
            <Badge variant="secondary">{eventCount} total</Badge>
          </div>

          <Card>
            <CardContent className="flex h-48 flex-col items-center justify-center gap-3 p-6">
              <Calendar className="h-12 w-12 text-muted-foreground" />
              <p className="text-center text-muted-foreground">
                Event management coming soon. Check the Discover page to see live events.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="worship" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Places of Worship</h2>
            <Badge variant="secondary">{stats.totalWorship} total</Badge>
          </div>

          <Card>
            <CardContent className="flex h-48 flex-col items-center justify-center gap-3 p-6">
              <Church className="h-12 w-12 text-muted-foreground" />
              <p className="text-center text-muted-foreground">
                Worship management coming soon. Check the Discover page to see live listings.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parks" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Parks & Playgrounds</h2>
            <Badge variant="secondary">{stats.totalParks} total</Badge>
          </div>

          <Card>
            <CardContent className="flex h-48 flex-col items-center justify-center gap-3 p-6">
              <TreePine className="h-12 w-12 text-muted-foreground" />
              <p className="text-center text-muted-foreground">
                Parks management coming soon. Check the Discover page to see live listings.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Professional Services</h2>
            <Badge variant="secondary">{stats.totalProfessionalServices} total</Badge>
          </div>

          <Card>
            <CardContent className="flex h-48 flex-col items-center justify-center gap-3 p-6">
              <Briefcase className="h-12 w-12 text-muted-foreground" />
              <p className="text-center text-muted-foreground">
                Professional services management coming soon. Check the Discover page to see live listings.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
