"use client"

import { Component, type ReactNode } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Form-specific Error Boundary
 *
 * Provides a lightweight error boundary for forms
 * that shows an inline error message instead of a full-page fallback.
 */
export class FormErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    console.error("[v0] Form error caught:", error)
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("[v0] Form error details:", {
      error: error.message,
      componentStack: errorInfo.componentStack,
    })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Form Error</AlertTitle>
          <AlertDescription className="mt-2 space-y-3">
            <p>Something went wrong with this form. Please try again.</p>
            {this.state.error?.message && <p className="text-xs font-mono opacity-75">{this.state.error.message}</p>}
            <Button onClick={this.handleReset} variant="outline" size="sm" className="gap-2 bg-transparent">
              <RefreshCw className="h-3 w-3" />
              Reset Form
            </Button>
          </AlertDescription>
        </Alert>
      )
    }

    return this.props.children
  }
}
