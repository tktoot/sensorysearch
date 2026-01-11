import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("[v0] OAuth callback error:", error)
      return NextResponse.redirect(`${requestUrl.origin}/intro?error=${error.message}`)
    }

    // Get user after successful auth
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      // Check if profile exists
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, has_seen_onboarding")
        .eq("id", user.id)
        .single()

      if (!profile) {
        // Create profile for OAuth user and mark onboarding complete
        await supabase.from("profiles").insert({
          id: user.id,
          email: user.email,
          has_seen_onboarding: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      } else if (!profile.has_seen_onboarding) {
        // Update existing profile to mark onboarding complete for OAuth
        await supabase
          .from("profiles")
          .update({
            has_seen_onboarding: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id)
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${requestUrl.origin}/discover`)
}
