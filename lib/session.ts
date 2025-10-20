/**
 * Session Management
 *
 * Handles cookie-based session tracking for analytics
 */

import { v4 as uuidv4 } from "uuid"

const SESSION_COOKIE_NAME = "ss_session"
const SESSION_DURATION_DAYS = 30

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") {
    // Server-side: generate a temporary ID
    return `server-${uuidv4()}`
  }

  // Client-side: check for existing session cookie
  const cookies = document.cookie.split("; ")
  const sessionCookie = cookies.find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`))

  if (sessionCookie) {
    return sessionCookie.split("=")[1]
  }

  // Create new session
  const sessionId = uuidv4()
  const expires = new Date()
  expires.setDate(expires.getDate() + SESSION_DURATION_DAYS)

  document.cookie = `${SESSION_COOKIE_NAME}=${sessionId}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`

  return sessionId
}

export function getSessionIdFromRequest(request: Request): string {
  const cookieHeader = request.headers.get("cookie") || ""
  const cookies = cookieHeader.split("; ")
  const sessionCookie = cookies.find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`))

  if (sessionCookie) {
    return sessionCookie.split("=")[1]
  }

  // Generate temporary session for this request
  return `temp-${uuidv4()}`
}

export const getSessionId = getOrCreateSessionId
