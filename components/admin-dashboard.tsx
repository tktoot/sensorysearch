"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MapPin, Calendar, AlertCircle, CheckCircle, XCircle, Loader2, ExternalLink, Mail, PhoneIcon, Clock, RefreshCw } from 'lucide-react'
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface Listing {
  id: string
  type: string
  title: string
  description: string
  address: string
  city: string
  state: string
  zip: string
  website: string | null
  email: string | null
  phone: string | null
  images: string[]
  status: string
  organizer_email: string | null
  submitted_at: string
  reviewed_at: string | null
  sensory_features: string[]
  event_date: string | null
  event_start_time: string | null
}

export function AdminDashboard() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    try {
      console.log("[v0] ADMIN_FETCH: Starting to fetch listings...")
      const supabase = createClient()
      
      const { data, error } = await supabase.from("listings").select("*").order("submitted_at", { ascending: false })

      console.log("[v0] ADMIN_FETCH: Supabase response", {
        success: !error,
        count: data?.length || 0,
        error: error?.message,
        data: data?.map(d => ({ id: d.id, title: d.title, status: d.status }))
      })

      if (error) {
        console.error("[v0] ADMIN_FETCH_ERROR:", error)
        throw error
      }

      console.log("[v0] ADMIN_FETCH_SUCCESS:", {
        total: data?.length || 0,
        pending: data?.filter(d => d.status === 'pending').length || 0,
        approved: data?.filter(d => d.status === 'approved').length || 0,
        rejected: data?.filter(d => d.status === 'rejected').length || 0,
      })

      setListings(data || [])
    } catch (error) {
      console.error("[v0] ADMIN_FETCH_FAILED:", error)
      toast({
        title: "Error",
        description: "Failed to load listings. Check console for details.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (listingId: string) => {
    setActionLoading(listingId)
    try {
      const response = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to approve")
      }

      toast({
        title: "Approved",
        description: "Listing has been approved successfully",
      })

      await fetchListings()
    } catch (error) {
      console.error("[v0] Approve error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve listing",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectClick = (listing: Listing) => {
    setSelectedListing(listing)
    setRejectionReason("")
    setRejectDialogOpen(true)
  }

  const handleRejectConfirm = async () => {
    if (!selectedListing) return

    setActionLoading(selectedListing.id)
    try {
      const response = await fetch("/api/admin/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: selectedListing.id,
          reason: rejectionReason || undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to reject")
      }

      toast({
        title: "Rejected",
        description: "Listing has been rejected",
      })

      setRejectDialogOpen(false)
      setSelectedListing(null)
      await fetchListings()
    } catch (error) {
      console.error("[v0] Reject error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reject listing",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const pendingListings = listings.filter((l) => l.status === "pending")
  const approvedListings = listings.filter((l) => l.status === "approved")
  const rejectedListings = listings.filter((l) => l.status === "rejected")

  const stats = {
    totalListings: listings.length,
    pending: pendingListings.length,
    approved: approvedListings.length,
    rejected: rejectedListings.length,
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
            <p className="text-lg text-muted-foreground">Manage and moderate submissions</p>
          </div>
          <Button
            onClick={fetchListings}
            disabled={loading}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalListings}</div>
            <p className="text-xs text-muted-foreground">All submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">Live listings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">Declined</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            Pending
            {stats.pending > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 px-1.5">
                {stats.pending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Approved
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            <XCircle className="h-4 w-4" />
            Rejected
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingListings.length === 0 ? (
            <Card>
              <CardContent className="flex h-48 flex-col items-center justify-center gap-3 p-6">
                <CheckCircle className="h-12 w-12 text-primary" />
                <p className="text-center text-muted-foreground">All caught up! No pending submissions to review.</p>
              </CardContent>
            </Card>
          ) : (
            pendingListings.map((listing) => (
              <Card key={listing.id} className="border-l-4 border-l-amber-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{listing.title}</CardTitle>
                      <CardDescription className="flex flex-wrap items-center gap-4">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {listing.city}, {listing.state}
                        </span>
                        {listing.organizer_email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {listing.organizer_email}
                          </span>
                        )}
                        <span className="text-xs">
                          {new Date(listing.submitted_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{listing.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {listing.images && listing.images.length > 0 && (
                    <div className="relative aspect-video overflow-hidden rounded-lg">
                      <img
                        src={listing.images[0] || "/placeholder.svg"}
                        alt={listing.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground">{listing.description}</p>

                  <div className="space-y-2 text-sm">
                    <p className="font-medium">Address:</p>
                    <p className="text-muted-foreground">{listing.address}</p>
                  </div>

                  {listing.event_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {new Date(listing.event_date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      {listing.event_start_time && (
                        <>
                          <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                          <span>{listing.event_start_time}</span>
                        </>
                      )}
                    </div>
                  )}

                  {listing.website && (
                    <a
                      href={listing.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {listing.website}
                    </a>
                  )}

                  {listing.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <PhoneIcon className="h-4 w-4 text-muted-foreground" />
                      <span>{listing.phone}</span>
                    </div>
                  )}

                  {listing.sensory_features && listing.sensory_features.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {listing.sensory_features.map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature.replace(/([A-Z])/g, " $1").trim()}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(listing.id)}
                      disabled={actionLoading === listing.id}
                      className="flex-1 gap-2"
                    >
                      {actionLoading === listing.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleRejectClick(listing)}
                      disabled={actionLoading === listing.id}
                      variant="outline"
                      className="flex-1 gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedListings.length === 0 ? (
            <Card>
              <CardContent className="flex h-48 flex-col items-center justify-center gap-3 p-6">
                <MapPin className="h-12 w-12 text-muted-foreground" />
                <p className="text-center text-muted-foreground">No approved listings yet.</p>
              </CardContent>
            </Card>
          ) : (
            approvedListings.map((listing) => (
              <Card key={listing.id} className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{listing.title}</h3>
                        <Badge variant="secondary">{listing.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {listing.city}, {listing.state}
                      </p>
                      {listing.reviewed_at && (
                        <p className="text-xs text-muted-foreground">
                          Approved on{" "}
                          {new Date(listing.reviewed_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedListings.length === 0 ? (
            <Card>
              <CardContent className="flex h-48 flex-col items-center justify-center gap-3 p-6">
                <XCircle className="h-12 w-12 text-muted-foreground" />
                <p className="text-center text-muted-foreground">No rejected listings.</p>
              </CardContent>
            </Card>
          ) : (
            rejectedListings.map((listing) => (
              <Card key={listing.id} className="border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{listing.title}</h3>
                        <Badge variant="secondary">{listing.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {listing.city}, {listing.state}
                      </p>
                      {listing.reviewed_at && (
                        <p className="text-xs text-muted-foreground">
                          Rejected on{" "}
                          {new Date(listing.reviewed_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                    <XCircle className="h-5 w-5 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Submission</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject "{selectedListing?.title}"? You can optionally provide a reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Textarea
              id="reason"
              placeholder="Explain why this submission is being rejected..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectConfirm} disabled={!!actionLoading}>
              {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Reject Submission
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
