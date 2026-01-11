"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserCircle, Mail } from "lucide-react"
import type { Profile } from "@/lib/profile-helpers"

interface ProfileDetailsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: Profile | null
  onProfileUpdate?: (profile: Profile) => void
}

export default function ProfileDetailsDrawer({ open, onOpenChange, profile }: ProfileDetailsDrawerProps) {
  if (!profile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <UserCircle className="h-5 w-5" />
              My Profile
            </SheetTitle>
            <SheetDescription>Your account information and preferences</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            <p className="text-sm text-muted-foreground">No profile data available</p>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <UserCircle className="h-5 w-5" />
            My Profile
          </SheetTitle>
          <SheetDescription>Your account information and preferences</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Basic Information</h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <UserCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">User ID</p>
                  <p className="font-medium text-xs break-all">{profile.id}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium break-all">{profile.email || "Not set"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          {(profile.home_zip || profile.age_focus || profile.radius_miles) && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Preferences</h3>

              <div className="space-y-2 rounded-lg bg-muted/50 p-3">
                {profile.home_zip && (
                  <div>
                    <p className="text-sm text-muted-foreground">Home ZIP</p>
                    <p className="font-medium">{profile.home_zip}</p>
                  </div>
                )}
                {profile.age_focus && (
                  <div>
                    <p className="text-sm text-muted-foreground">Age Focus</p>
                    <p className="font-medium">{profile.age_focus}</p>
                  </div>
                )}
                {profile.radius_miles && (
                  <div>
                    <p className="text-sm text-muted-foreground">Search Radius</p>
                    <p className="font-medium">{profile.radius_miles} miles</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Onboarding Status */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Status</h3>

            <div className="flex items-center gap-2">
              <Badge variant={profile.has_seen_onboarding ? "default" : "secondary"}>
                {profile.has_seen_onboarding ? "Onboarding Complete" : "Onboarding Pending"}
              </Badge>
            </div>
          </div>

          {/* Close Button */}
          <Button onClick={() => onOpenChange(false)} className="w-full gap-2">
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
