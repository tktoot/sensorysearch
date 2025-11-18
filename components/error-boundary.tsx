"use client"

import type React from "react"

import { Component, type ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Home, RefreshCw } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: any) => void
  resetKeys?: any[]
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Reusable Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI.
 *
 * Usage:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    console.error("[v0] ErrorBoundary caught error:", error)
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("[v0] ErrorBoundary - Error details:", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log to external error tracking service (e.g., Sentry)
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(error, { contexts: { react: errorInfo } })
    // }
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error boundary when resetKeys change
    if (this.state.hasError && this.props.resetKeys) {
      const hasResetKeyChanged = this.props.resetKeys.some((key, index) => key !== prevProps.resetKeys?.[index])
      if (hasResetKeyChanged) {
        this.setState({ hasError: false, error: null })
      }
    }
  }

  handleReset = () => {
    console.log("[v0] ErrorBoundary - User clicked reset")
    this.setState({ hasError: false, error: null })
  }

  handleReload = () => {
    console.log("[v0] ErrorBoundary - User clicked reload")
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <div className="container mx-auto px-4 py-16">
          <Card className="mx-auto max-w-lg border-destructive/50">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Something went wrong</CardTitle>
              <CardDescription>We encountered an unexpected error. Please try again.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.error?.message && (
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs font-mono text-muted-foreground">{this.state.error.message}</p>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <Button onClick={this.handleReset} className="w-full gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                <Button variant="outline" onClick={this.handleReload} className="w-full gap-2 bg-transparent">
                  <RefreshCw className="h-4 w-4" />
                  Reload Page
                </Button>
                <Button variant="ghost" onClick={() => (window.location.href = "/")} className="w-full gap-2">
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  If this problem persists,{" "}
                  <a href="mailto:support@calmseek.com" className="text-primary hover:underline">
                    contact support
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

/**
 * Hook-based error boundary wrapper for functional components
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, "children">,
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || "Component"})`

  return WrappedComponent
}
