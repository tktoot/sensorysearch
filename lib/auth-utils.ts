export type UserRole = "user" | "organizer" | "business" | "admin"

export interface AuthUser {
  email: string
  role: UserRole
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === "undefined") return null

  const userStr = localStorage.getItem("currentUser")
  if (!userStr) return null

  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

export function setCurrentUser(user: AuthUser | null) {
  if (typeof window === "undefined") return

  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user))
  } else {
    localStorage.removeItem("currentUser")
  }
}

export function hasRole(requiredRole: UserRole): boolean {
  const user = getCurrentUser()
  if (!user) return false

  // Admin has access to everything
  if (user.role === "admin") return true

  // Organizer and business are equivalent
  if (requiredRole === "organizer" && (user.role === "organizer" || user.role === "business")) return true
  if (requiredRole === "business" && (user.role === "business" || user.role === "organizer")) return true

  // User role check
  if (requiredRole === "user") return true

  return false
}
