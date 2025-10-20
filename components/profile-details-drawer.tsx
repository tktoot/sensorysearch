"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserCircle, Mail, Phone, Edit, Building2 } from "lucide-react"
import type { UserProfile } from "@/lib/mock-data"

interface ProfileDetailsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: UserProfile
  onEdit: () => void
}

const ageOptions = [
  { value: "toddlers", label: "Toddlers", description: "0-5 years", emoji: "👶" },
  { value: "children", label: "Children", description: "6-12 years", emoji: "🧒" },
  { value: "teens", label: "Teens", description: "13-17 years", emoji: "👦" },
  { value: "adults", label: "Adults", description: "18+ years", emoji: "👤" },
] as const

export function ProfileDetailsDrawer({ open, onOpenChange, profile, onEdit }: ProfileDetailsDrawerProps) {
  const selectedAge = ageOptions.find((opt) => opt.value === profile.agePreference)

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
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{profile.name || "Not set"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium break-all">{profile.email || "Not set"}</p>
                </div>
              </div>

              {profile.phone_number && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{profile.phone_number}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Age Preference */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Age Preference</h3>

            {selectedAge ? (
              <div className="flex items-center gap-3 rounded-lg border-2 border-primary bg-primary/5 p-3">
                <span className="text-2xl">{selectedAge.emoji}</span>
                <div className="flex-1">
                  <div className="font-medium">{selectedAge.label}</div>
                  <div className="text-sm text-muted-foreground">{selectedAge.description}</div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No age preference set</p>
            )}
          </div>

          {/* Account Type */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Account Type</h3>

            <div className="flex items-center gap-2">
              {profile.role === "business" ? (
                <Badge variant="default" className="gap-1">
                  <Building2 className="h-3 w-3" />
                  Organizer Account
                </Badge>
              ) : profile.role === "admin" ? (
                <Badge variant="secondary">Admin Account</Badge>
              ) : (
                <Badge variant="outline">Personal Account</Badge>
              )}
            </div>

            {profile.role === "business" && profile.business_name && (
              <div className="space-y-2 rounded-lg bg-muted/50 p-3">
                <div>
                  <p className="text-sm text-muted-foreground">Business Name</p>
                  <p className="font-medium">{profile.business_name}</p>
                </div>
                {profile.business_website && (
                  <div>
                    <p className="text-sm text-muted-foreground">Website</p>
                    <p className="font-medium text-sm break-all">{profile.business_website}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Edit Button */}
          <Button onClick={onEdit} className="w-full gap-2">
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
