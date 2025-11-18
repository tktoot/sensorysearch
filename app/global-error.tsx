"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

/**
 * Global Error Handler
 *
 * This catches errors in the root layout.
 * It's a last resort fallback for critical errors.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[v0] GLOBAL ERROR - Critical application error:", error)

    // Log to external error tracking service
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(error, { level: 'fatal' })
    // }
  }, [error])

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <Card className="max-w-lg border-destructive/50">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-3xl">Critical Error</CardTitle>
              <CardDescription className="text-base">
                The application encountered a critical error and needs to restart.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error.message && (
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm font-mono text-muted-foreground">{error.message}</p>
                  {error.digest && <p className="mt-2 text-xs text-muted-foreground">Error ID: {error.digest}</p>}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <Button onClick={reset} className="w-full">
                  Restart Application
                </Button>
                <Button variant="outline" onClick={() => (window.location.href = "/")} className="w-full">
                  Go to Homepage
                </Button>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Need help?{" "}
                  <a href="mailto:support@calmseek.com" className="text-primary hover:underline">
                    Contact Support
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  )
}
