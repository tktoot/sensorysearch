/**
 * API Route Logging Utility
 *
 * Provides consistent logging for all API routes with sanitization
 */

interface LogContext {
  route: string
  method: string
  userId?: string
  email?: string
  body?: any
  error?: any
  success?: boolean
  duration?: number
}

/**
 * Sanitize request body to remove sensitive data
 */
function sanitizeBody(body: any): any {
  if (!body) return body

  const sanitized = { ...body }
  const sensitiveFields = ["password", "token", "apiKey", "secret", "creditCard"]

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = "[REDACTED]"
    }
  }

  return sanitized
}

/**
 * Log API request start
 */
export function logApiRequest(context: LogContext) {
  const { route, method, userId, email, body } = context

  console.log(`[v0] API_REQUEST_START - ${method} ${route}`, {
    userId: userId || "anonymous",
    email: email || "none",
    body: body ? sanitizeBody(body) : undefined,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Log API request success
 */
export function logApiSuccess(context: LogContext) {
  const { route, method, userId, duration } = context

  console.log(`[v0] API_REQUEST_SUCCESS - ${method} ${route}`, {
    userId: userId || "anonymous",
    duration: duration ? `${duration}ms` : undefined,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Log API request error
 */
export function logApiError(context: LogContext) {
  const { route, method, userId, error } = context

  console.error(`[v0] API_REQUEST_ERROR - ${method} ${route}`, {
    userId: userId || "anonymous",
    error: error?.message || error,
    stack: error?.stack,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Wrapper for API route handlers with automatic logging
 */
export function withApiLogging<T>(route: string, handler: (request: Request, context?: any) => Promise<T>) {
  return async (request: Request, context?: any): Promise<T> => {
    const startTime = Date.now()
    const method = request.method

    try {
      // Parse body if present
      let body: any
      try {
        const clonedRequest = request.clone()
        body = await clonedRequest.json()
      } catch {
        // No body or invalid JSON
      }

      logApiRequest({ route, method, body })

      const result = await handler(request, context)
      const duration = Date.now() - startTime

      logApiSuccess({ route, method, duration })

      return result
    } catch (error) {
      const duration = Date.now() - startTime
      logApiError({ route, method, error, duration })
      throw error
    }
  }
}
