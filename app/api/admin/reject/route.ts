import { createAdminClient } from "@/lib/supabase-admin"
import { createClient } from "@/lib/supabase/server"
import { ADMIN_EMAILS } from "@/lib/config"
import { type NextRequest, NextResponse } from "next/server"
import { sendRejectionNotification } from "@/lib/email-utils"
import { logApiRequest, logApiSuccess, logApiError } from "@/lib/api-logger"
import { rejectListingSchema } from "@/lib/validation-schemas"
import { ZodError } from "zod"

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const body = await request.json()
    logApiRequest({
      route: "/api/admin/reject",
      method: "POST",
      userId: user?.id,
      email: user?.email,
      body,
    })

    if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() || "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    let validatedData
    try {
      validatedData = rejectListingSchema.parse(body)
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }))

        return NextResponse.json(
          {
            error: "Validation failed",
            details: formattedErrors,
          },
          { status: 400 },
        )
      }
      throw error
    }

    const { listingId, reason } = validatedData

    const adminClient = createAdminClient()

    const { data: listing } = await adminClient.from("listings").select("*").eq("id", listingId).single()

    const { error } = await adminClient
      .from("listings")
      .update({
        status: "rejected",
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        rejection_reason: reason || null,
      })
      .eq("id", listingId)

    if (error) {
      console.error("[v0] Reject error:", error)
      logApiError({
        route: "/api/admin/reject",
        method: "POST",
        userId: user.id,
        error,
      })
      throw error
    }

    console.log("[v0] Listing rejected:", listingId)

    if (listing?.organizer_email) {
      try {
        await sendRejectionNotification({
          submitterEmail: listing.organizer_email,
          title: listing.title,
          type: listing.type,
          reason: reason,
        })
      } catch (emailError) {
        console.error("[v0] Failed to send rejection email:", emailError)
        // Don't fail the rejection if email fails
      }
    }

    const duration = Date.now() - startTime
    logApiSuccess({
      route: "/api/admin/reject",
      method: "POST",
      userId: user.id,
      duration,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Reject error:", error)
    logApiError({
      route: "/api/admin/reject",
      method: "POST",
      error,
    })
    return NextResponse.json({ error: "Failed to reject" }, { status: 500 })
  }
}
