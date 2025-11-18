/**
 * Error Logger Utility
 *
 * Centralized error logging for consistent error tracking
 * across the application.
 */

export interface ErrorLogContext {
  userId?: string
  email?: string
  route?: string
  action?: string
  metadata?: Record<string, any>
}

export function logError(error: Error | unknown, context?: ErrorLogContext) {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorStack = error instanceof Error ? error.stack : undefined

  console.error("[v0] ERROR_LOGGED", {
    message: errorMessage,
    stack: errorStack,
    context,
    timestamp: new Date().toISOString(),
  })

  // Send to external error tracking service
  // if (typeof window !== 'undefined' && window.Sentry) {
  //   window.Sentry.captureException(error, {
  //     contexts: { custom: context },
  //   })
  // }

  // Could also send to your own logging endpoint
  // try {
  //   fetch('/api/logs/error', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({
  //       message: errorMessage,
  //       stack: errorStack,
  //       context,
  //       timestamp: new Date().toISOString(),
  //     }),
  //   })
  // } catch (logError) {
  //   console.error('[v0] Failed to send error log:', logError)
  // }
}

export function logWarning(message: string, context?: ErrorLogContext) {
  console.warn("[v0] WARNING", {
    message,
    context,
    timestamp: new Date().toISOString(),
  })
}

export function logInfo(message: string, context?: ErrorLogContext) {
  console.log("[v0] INFO", {
    message,
    context,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Async error handler wrapper
 * Wraps async functions to catch and log errors
 */
export function withErrorHandler<T extends (...args: any[]) => Promise<any>>(fn: T, context?: ErrorLogContext): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args)
    } catch (error) {
      logError(error, context)
      throw error
    }
  }) as T
}

/**
 * Safe async wrapper
 * Returns [error, result] tuple instead of throwing
 */
export async function safeAsync<T>(promise: Promise<T>, context?: ErrorLogContext): Promise<[Error | null, T | null]> {
  try {
    const result = await promise
    return [null, result]
  } catch (error) {
    logError(error, context)
    return [error instanceof Error ? error : new Error(String(error)), null]
  }
}
