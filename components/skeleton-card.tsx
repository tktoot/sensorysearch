"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function SkeletonCard() {
  return (
    <Card className="flex flex-col animate-pulse">
      <div className="relative aspect-video overflow-hidden rounded-t-lg bg-muted" />
      <CardHeader>
        <div className="h-5 w-3/4 bg-muted rounded" />
        <div className="space-y-2 mt-2">
          <div className="h-3 w-1/2 bg-muted rounded" />
          <div className="h-3 w-2/3 bg-muted rounded" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <div className="h-12 w-full bg-muted rounded" />
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-muted rounded-full" />
          <div className="h-6 w-16 bg-muted rounded-full" />
        </div>
      </CardContent>
    </Card>
  )
}
