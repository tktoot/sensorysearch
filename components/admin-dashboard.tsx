"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  Users,
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
} from "lucide-react"
import { mockVenues, mockEvents, mockSubmissions } from "@/lib/mock-data"

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
  const [submissions] = useState(mockSubmissions)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])

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
  }, [])

  const stats = {
    totalVenues: mockVenues.length,
    totalEvents: mockEvents.length,
    pendingSubmissions: submissions.filter((s) => s.status === "pending").length,
    approvedToday: submissions.filter(
      (s) =>
        s.status === "approved" && s.reviewedAt && new Date(s.reviewedAt).toDateString() === new Date().toDateString(),
    ).length,
    activeSubscribers: subscriptions.filter((s) => s.status === "active").length,
    monthlyRevenue: subscriptions.filter((s) => s.status === "active").reduce((sum, s) => sum + s.monthlyPrice, 0),
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
        <p className="text-lg text-muted-foreground">Manage venues, events, and moderate user submissions</p>
      </div>

      {/* Stats Overview */}
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
        <TabsList>
          <TabsTrigger value="moderation" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            Moderation Queue
            {stats.pendingSubmissions > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 px-1.5">
                {stats.pendingSubmissions}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="subscribers" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Subscribers
          </TabsTrigger>
          <TabsTrigger value="venues" className="gap-2">
            <MapPin className="h-4 w-4" />
            Venues
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-2">
            <Calendar className="h-4 w-4" />
            Events
          </TabsTrigger>
        </TabsList>

        <TabsContent value="moderation" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Pending Submissions</h2>
            <Badge variant="secondary">{stats.pendingSubmissions} pending</Badge>
          </div>

          <div className="space-y-4">
            {submissions
              .filter((s) => s.status === "pending")
              .filter((s) => s.venue && s.venue.name)
              .map((submission) => (
                <Card key={submission.id} className="border-l-4 border-l-accent">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-xl">{submission.venue.name}</CardTitle>
                        <CardDescription className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {submission.venue.city}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {submission.submittedBy}
                          </span>
                          <span className="text-xs">
                            {new Date(submission.submittedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </CardDescription>
                      </div>
                      <Badge>{submission.venue.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative aspect-video overflow-hidden rounded-lg">
                      <img
                        src={submission.venue.imageUrl || "/placeholder.svg"}
                        alt={submission.venue.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <p className="text-sm text-muted-foreground">{submission.venue.description}</p>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">
                        Noise: {submission.venue.sensoryAttributes.noiseLevel}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Light: {submission.venue.sensoryAttributes.lighting}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Crowd: {submission.venue.sensoryAttributes.crowdDensity}
                      </Badge>
                      {submission.venue.sensoryAttributes.wheelchairAccessible && (
                        <Badge variant="outline" className="text-xs">
                          Wheelchair Accessible
                        </Badge>
                      )}
                      {submission.venue.sensoryAttributes.sensoryFriendlyHours && (
                        <Badge variant="outline" className="text-xs">
                          Sensory-Friendly Hours
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                        <CheckCircle className="mr-2 inline-block h-4 w-4" />
                        Approve
                      </button>
                      <button className="flex-1 rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                        <XCircle className="mr-2 inline-block h-4 w-4" />
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
                  <p className="text-center text-muted-foreground">All caught up! No pending submissions to review.</p>
                </CardContent>
              </Card>
            )}
          </div>
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
            <Badge variant="secondary">{mockVenues.length} total</Badge>
          </div>

          <div className="space-y-3">
            {mockVenues.map((venue) => (
              <Card key={venue.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-lg">
                      <img
                        src={venue.imageUrl || "/placeholder.svg"}
                        alt={venue.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{venue.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {venue.category} • {venue.city}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{venue.rating} ★</p>
                      <p className="text-xs text-muted-foreground">{venue.reviewCount} reviews</p>
                    </div>
                    <button className="rounded-lg border border-border bg-transparent px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                      Edit
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">All Events</h2>
            <Badge variant="secondary">{mockEvents.length} upcoming</Badge>
          </div>

          <div className="space-y-3">
            {mockEvents.map((event) => (
              <Card key={event.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-lg">
                      <img
                        src={event.imageUrl || "/placeholder.svg"}
                        alt={event.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{event.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.venueName} •{" "}
                        {new Date(event.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{event.crowdLevel || "Not specified"}</p>
                      <p className="text-xs text-muted-foreground">crowd level</p>
                    </div>
                    <button className="rounded-lg border border-border bg-transparent px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                      Edit
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
