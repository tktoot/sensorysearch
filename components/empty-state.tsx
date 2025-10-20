"use client"

import { Card, CardContent } from "@/components/ui/card"
import { MapPin } from "lucide-react"

export function EmptyState() {
  return (
    <Card className="col-span-full">
      <CardContent className="flex flex-col items-center justify-center gap-4 p-12 text-center">
        <div className="rounded-full bg-primary/10 p-4">
          <MapPin className="h-12 w-12 text-primary" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Set your location to discover sensory-friendly events near you</h3>
          <p className="text-muted-foreground max-w-md">
            Enable location access or enter your ZIP code above to find calm, welcoming events and venues in your area.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
