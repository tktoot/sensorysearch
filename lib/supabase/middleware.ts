import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "tktoot1@yahoo.com,tktut1@yahoo.com,contact@sensorysearch.com")
  .split(",")
  .map((email) => email.trim().toLowerCase())

const PUBLIC_ROUTES = [
  "/intro",
  "/legal",
  "/legal/terms",
  "/legal/privacy",
  "/legal/refund-and-advertising",
  "/about",
  "/contact",
  "/resources",
  "/pricing",
  "/terms-of-service",
  "/privacy-policy",
  "/refund-policy",
  "/api/auth/callback",
]

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  // IMPORTANT: Always call getUser() to refresh the session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
  const isApiRoute = pathname.startsWith("/api/")
  const isStaticFile = pathname.startsWith("/_next/") || pathname.includes(".")

  if (!user && !isPublicRoute && !isApiRoute && !isStaticFile && pathname !== "/") {
    console.log("[v0] Middleware: Protected route accessed without auth, redirecting to intro")
    const redirectUrl = new URL("/intro", request.url)
    redirectUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (user?.email) {
    const isAdmin = ADMIN_EMAILS.includes(user.email.toLowerCase())

    // First, check the existing user record to preserve organizer role
    const { data: existingUser } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()

    // Determine the role:
    // - Admin email always gets admin role
    // - Existing organizer role is preserved
    // - New users get "user" role
    let role: string
    if (isAdmin) {
      role = "admin"
    } else if (existingUser?.role === "organizer" || existingUser?.role === "business") {
      // PRESERVE organizer/business role - don't overwrite it
      role = existingUser.role
    } else if (existingUser?.role) {
      // Keep existing role
      role = existingUser.role
    } else {
      // New user, default to "user"
      role = "user"
    }

    // Update user record with role and last login timestamp
    await supabase
      .from("users")
      .upsert(
        {
          id: user.id,
          email: user.email,
          role: role,
          last_login_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        },
      )
      .then(({ error }) => {
        if (error) {
          console.error("[v0] Failed to sync user role:", error)
        }
      })

    // Check if this is an OAuth callback (user just signed in via OAuth)
    const isOAuthCallback =
      request.nextUrl.searchParams.has("code") || request.nextUrl.pathname.includes("/auth/callback")

    if (isOAuthCallback) {
      // Ensure profile exists
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, has_seen_onboarding")
        .eq("id", user.id)
        .single()

      if (!profile) {
        // Create profile if it doesn't exist
        await supabase
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email,
            has_seen_onboarding: true, // Mark as complete for OAuth users
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .then(({ error }) => {
            if (error) {
              console.error("[v0] Failed to create profile:", error)
            } else {
              console.log("[v0] Created profile and marked onboarding complete for OAuth user")
            }
          })
      } else if (!profile.has_seen_onboarding) {
        // Update existing profile to mark onboarding complete
        await supabase
          .from("profiles")
          .update({
            has_seen_onboarding: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id)
          .then(({ error }) => {
            if (error) {
              console.error("[v0] Failed to update profile:", error)
            } else {
              console.log("[v0] Marked onboarding complete for OAuth user")
            }
          })
      }
    }
  }

  return supabaseResponse
}
