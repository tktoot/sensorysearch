import { createAdminClient } from "@/lib/supabase-admin"
import { createClient } from "@/lib/supabase/server"
import { ADMIN_EMAILS } from "@/lib/config"
import { type NextRequest, NextResponse } from "next/server"
import { sendApprovalNotification } from "@/lib/email-utils"
import { logApiRequest, logApiSuccess, logApiError } from "@/lib/api-logger"
import { approveListingSchema } from "@/lib/validation-schemas"
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
      route: "/api/admin/approve",
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
      validatedData = approveListingSchema.parse(body)
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

    const { listingId } = validatedData

    const adminClient = createAdminClient()

    const { data: listing } = await adminClient.from("listings").select("*").eq("id", listingId).single()

    const { error } = await adminClient
      .from("listings")
      .update({
        status: "approved",
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq("id", listingId)

    if (error) {
      console.error("[v0] Approve error:", error)
      logApiError({
        route: "/api/admin/approve",
        method: "POST",
        userId: user.id,
        error,
      })
      throw error
    }

    console.log("[v0] Listing approved:", listingId)

    if (listing?.organizer_email) {
      try {
        await sendApprovalNotification({
          submitterEmail: listing.organizer_email,
          title: listing.title,
          type: listing.type,
        })
      } catch (emailError) {
        console.error("[v0] Failed to send approval email:", emailError)
        // Don't fail the approval if email fails
      }
    }

    const duration = Date.now() - startTime
    logApiSuccess({
      route: "/api/admin/approve",
      method: "POST",
      userId: user.id,
      duration,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Approve error:", error)
    logApiError({
      route: "/api/admin/approve",
      method: "POST",
      error,
    })
    return NextResponse.json({ error: "Failed to approve" }, { status: 500 })
  }
}
