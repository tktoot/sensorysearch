import { type NextRequest, NextResponse } from "next/server"
import { getServerUser } from "@/lib/auth-server"
import { createClient } from "@/lib/supabase/server"
import { sendSubmissionNotification } from "@/lib/email-utils"
import { logApiRequest, logApiSuccess, logApiError } from "@/lib/api-logger"
import { submissionSchema } from "@/lib/validation-schemas"
import { ZodError } from "zod"

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    console.log("[v0] SUBMISSION_API: Request received")

    const user = await getServerUser()
    console.log("[v0] SUBMISSION_API: User check", {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
    })

    const body = await request.json()
    console.log("[v0] SUBMISSION_API: Body parsed", {
      type: body.type,
      title: body.title,
      hasImages: !!body.images,
      imageCount: body.images?.length || 0,
    })

    logApiRequest({
      route: "/api/submissions",
      method: "POST",
      userId: user?.id,
      email: user?.email,
      body,
    })

    if (!user) {
      console.log("[v0] SUBMISSION_API: Unauthorized - no user")
      return NextResponse.json({ error: "Unauthorized - Please sign in" }, { status: 401 })
    }

    let validatedData
    try {
      validatedData = submissionSchema.parse(body)
      console.log("[v0] SUBMISSION_API: Validation passed")
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }))

        console.error("[v0] SUBMISSION_API: Validation failed", formattedErrors)
        logApiError({
          route: "/api/submissions",
          method: "POST",
          userId: user.id,
          error: { message: "Validation failed", errors: formattedErrors },
        })

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

    const { type, title, description, address, hours, website, contactEmail, phone, sensoryAttributes, images } =
      validatedData

    // Extract date and time for events
    const date = "date" in validatedData ? validatedData.date : null
    const time = "time" in validatedData ? validatedData.time : null

    console.log("[v0] SUBMISSION_API: Creating Supabase client...")
    const supabase = await createClient()

    const insertData = {
      type,
      title,
      description,
      address: `${address.street}, ${address.city}, ${address.state} ${address.zip}`,
      city: address.city,
      state: address.state,
      zip: address.zip,
      event_date: date || null,
      event_start_time: time || null,
      hours: hours || null,
      website: website || null,
      email: contactEmail || null,
      phone: phone || null,
      sensory_features: sensoryAttributes
        ? Object.keys(sensoryAttributes).filter((k) => sensoryAttributes[k as keyof typeof sensoryAttributes])
        : [],
      images: images || [],
      status: "pending",
      organizer_id: user.id,
      organizer_email: user.email,
      submitted_at: new Date().toISOString(),
      source: "organizer_submission",
    }

    console.log("[v0] SUBMISSION_API: Inserting into database...", {
      type: insertData.type,
      title: insertData.title,
      status: insertData.status,
      imageCount: insertData.images.length,
    })

    const { data: submission, error } = await supabase.from("listings").insert(insertData).select().single()

    if (error) {
      console.error("[v0] SUBMISSION_API: Database error:", error)
      logApiError({
        route: "/api/submissions",
        method: "POST",
        userId: user.id,
        error,
      })
      return NextResponse.json({ error: "Failed to create submission: " + error.message }, { status: 500 })
    }

    console.log("[v0] SUBMISSION_API: Database insert successful", {
      id: submission.id,
      status: submission.status,
    })

    // Send email notification
    try {
      console.log("[v0] SUBMISSION_API: Attempting to send email notification...")
      await sendSubmissionNotification({
        type,
        title,
        description,
        submitterEmail: user.email || "unknown",
        submissionId: submission.id,
        images: images || [],
      })
      console.log("[v0] SUBMISSION_API: Email notification sent successfully")
    } catch (emailError) {
      console.error("[v0] SUBMISSION_API: Email notification failed:", emailError)
      // Don't fail the submission if email fails
    }

    console.log("[v0] SUBMISSION_CREATED", {
      id: submission.id,
      type,
      title,
      submitter: user.email,
      images: images?.length || 0,
    })

    const duration = Date.now() - startTime
    logApiSuccess({
      route: "/api/submissions",
      method: "POST",
      userId: user.id,
      duration,
    })

    return NextResponse.json({ success: true, id: submission.id })
  } catch (error) {
    console.error("[v0] SUBMISSION_API: Unexpected error:", error)
    logApiError({
      route: "/api/submissions",
      method: "POST",
      error,
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
