/**
 * Feature Flags Configuration
 *
 * Controls which features are enabled in the application.
 * Set via environment variables.
 */

export const BILLING_ENABLED = process.env.NEXT_PUBLIC_BILLING_ENABLED === "true"
export const SEED_BETA_DATA = process.env.NEXT_PUBLIC_SEED_BETA_DATA === "true"
export const ANALYTICS_ENABLED = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== "false" // Default true
export const GA_ENABLED = process.env.NEXT_PUBLIC_GA_ENABLED === "true" // Default false

export const AUTH_ENABLED = process.env.NEXT_PUBLIC_AUTH_ENABLED !== "false" // Default true
export const EMAIL_LOGIN_ENABLED = process.env.NEXT_PUBLIC_EMAIL_LOGIN_ENABLED !== "false" // Default true
export const GOOGLE_LOGIN_ENABLED = process.env.NEXT_PUBLIC_GOOGLE_LOGIN_ENABLED === "true" // Default false
export const APPLE_LOGIN_ENABLED = process.env.NEXT_PUBLIC_APPLE_LOGIN_ENABLED === "true" // Default false

export const BETA_ENABLED = process.env.NEXT_PUBLIC_BETA_ENABLED === "true"
export const BETA_FREE_MONTHS = Number.parseInt(process.env.NEXT_PUBLIC_BETA_FREE_MONTHS || "3", 10)
export const BETA_NOTIFY_EMAIL = process.env.BETA_NOTIFY_EMAIL || "contact@sensorysearch.com"
export const UPLOAD_MAX_MB = Number.parseInt(process.env.UPLOAD_MAX_MB || "5", 10)
export const UPLOAD_MAX_IMAGES = Number.parseInt(process.env.UPLOAD_MAX_IMAGES || "5", 10)

export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "contact@sensorysearch.com,tktoot1@yahoo.com,tktut1@yahoo.com")
  .split(",")
  .map((email) => email.trim().toLowerCase())

console.log("[v0] CONFIG_LOADED - Billing enabled:", BILLING_ENABLED)
console.log("[v0] CONFIG_LOADED - Seed beta data:", SEED_BETA_DATA)
console.log("[v0] CONFIG_LOADED - Analytics enabled:", ANALYTICS_ENABLED)
console.log("[v0] CONFIG_LOADED - GA enabled:", GA_ENABLED)
console.log("[v0] CONFIG_LOADED - Auth enabled:", AUTH_ENABLED)
console.log("[v0] CONFIG_LOADED - Email login enabled:", EMAIL_LOGIN_ENABLED)
console.log("[v0] CONFIG_LOADED - Google login enabled:", GOOGLE_LOGIN_ENABLED)
console.log("[v0] CONFIG_LOADED - Apple login enabled:", APPLE_LOGIN_ENABLED)
console.log("[v0] CONFIG_LOADED - Beta enabled:", BETA_ENABLED)
console.log("[v0] CONFIG_LOADED - Beta free months:", BETA_FREE_MONTHS)
console.log("[v0] CONFIG_LOADED - Beta notify email:", BETA_NOTIFY_EMAIL)
console.log("[v0] CONFIG_LOADED - Upload max MB:", UPLOAD_MAX_MB)
console.log("[v0] CONFIG_LOADED - Upload max images:", UPLOAD_MAX_IMAGES)
console.log("[v0] CONFIG_LOADED - Admin emails:", ADMIN_EMAILS)
