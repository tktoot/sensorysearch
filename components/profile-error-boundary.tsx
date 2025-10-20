"use client"

import { Component, type ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ProfileErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    console.error("[v0] PROFILE_LOAD_ERROR - Profile page crashed", error)
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("[v0] PROFILE_LOAD_ERROR - Error details", { error, errorInfo })
  }

  handleRetry = () => {
    console.log("[v0] PROFILE_RETRY - User clicked retry")
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto px-4 py-16">
          <Card className="mx-auto max-w-2xl border-destructive/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Unable to Load Profile</CardTitle>
                  <CardDescription>We couldn't load your profile just now</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">
                  Something went wrong while loading your profile. This could be a temporary issue.
                </p>
              </div>

              <div className="flex gap-3">
                <Button onClick={this.handleRetry} className="flex-1">
                  Try Again
                </Button>
                <Button variant="outline" onClick={() => (window.location.href = "/")}>
                  Go Home
                </Button>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Still having issues?{" "}
                  <a href="mailto:support@calmseek.com" className="text-primary hover:underline">
                    Contact Support
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
