"use client"

import { Suspense } from "react"
import IntroContent from "@/components/intro-content"

export default function IntroPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <IntroContent />
    </Suspense>
  )
}
