import { type NextRequest, NextResponse } from "next/server"
import { sendAdvertiseFormNotification } from "@/lib/email-utils"
import { logApiRequest, logApiSuccess, logApiError } from "@/lib/api-logger"

export async function POST(request: NextRequest) {
  const requestId = `advertise_${Date.now()}`
  
  try {
    logApiRequest(requestId, "POST /api/advertise-submission", {})
    
    const body = await request.json()
    
    const result = await sendAdvertiseFormNotification({
      businessName: body.businessName,
      contactName: body.contactName,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
      contactWebsite: body.contactWebsite,
      eventTitle: body.eventTitle,
      description: body.description,
      address: body.address,
      city: body.city,
      category: body.category,
      sensoryFeatures: body.sensoryFeatures || [],
      isVenue: body.isVenue,
      isEvent: body.isEvent,
      isFeatured: body.isFeatured,
    })

    if (!result.success) {
      logApiError(requestId, "Failed to send email", result.error)
      return NextResponse.json(
        { error: "Failed to send notification email" },
        { status: 500 }
      )
    }

    logApiSuccess(requestId, { emailSent: true, messageId: result.messageId })
    
    return NextResponse.json({ 
      success: true, 
      messageId: result.messageId 
    })
  } catch (error) {
    logApiError(requestId, "Exception in advertise submission", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
