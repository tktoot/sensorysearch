// Central type definitions for the application

export type UserRole = "user" | "organizer" | "business" | "admin"

export interface User {
  id: string
  email: string
  role: UserRole
}

export interface ServerAuthUser {
  id: string
  email: string
  role: UserRole
}
