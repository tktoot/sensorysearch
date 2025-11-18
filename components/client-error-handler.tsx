"use client"

import { useEffect } from "react"

/**
 * Client-side Error Handler
 *
 * Catches unhandled promise rejections and global errors
 * that occur outside of React component boundaries.
 */
export function ClientErrorHandler() {
  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("[v0] Unhandled promise rejection:", event.reason)

      // Prevent default browser behavior
      event.preventDefault()

      // Log to external error tracking service
      // if (typeof window !== 'undefined' && window.Sentry) {
      //   window.Sentry.captureException(event.reason)
      // }
    }

    // Handle global errors
    const handleError = (event: ErrorEvent) => {
      console.error("[v0] Global error:", {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      })

      // Log to external error tracking service
      // if (typeof window !== 'undefined' && window.Sentry) {
      //   window.Sentry.captureException(event.error)
      // }
    }

    // Add event listeners
    window.addEventListener("unhandledrejection", handleUnhandledRejection)
    window.addEventListener("error", handleError)

    // Cleanup
    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
      window.removeEventListener("error", handleError)
    }
  }, [])

  return null
}
