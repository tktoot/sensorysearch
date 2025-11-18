import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendSubmissionNotification(submission: {
  type: "venue" | "event" | "park"
  businessName: string
  contactName: string
  contactEmail: string
  contactPhone: string
  description: string
  address?: string
  city?: string
  category: string
  sensoryFeatures: string[]
  photoCount?: number
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log("[v0] EMAIL_SKIP - RESEND_API_KEY not configured")
    return { success: false, error: "Email service not configured" }
  }

  const adminEmail = process.env.BETA_NOTIFY_EMAIL || "tktoot1@yahoo.com"

  console.log("[v0] EMAIL_SENDING - New submission notification", {
    to: adminEmail,
    type: submission.type,
    businessName: submission.businessName,
  })

  try {
    const { data, error } = await resend.emails.send({
      from: "SensorySearch <onboarding@resend.dev>",
      to: [adminEmail],
      subject: `New ${submission.type} submission: ${submission.businessName}`,
      html: `
        <h2>New ${submission.type.toUpperCase()} Submission</h2>
        <h3>${submission.businessName}</h3>
        
        <p><strong>Contact:</strong> ${submission.contactName}</p>
        <p><strong>Email:</strong> ${submission.contactEmail}</p>
        <p><strong>Phone:</strong> ${submission.contactPhone}</p>
        
        ${submission.address ? `<p><strong>Address:</strong> ${submission.address}</p>` : ""}
        ${submission.city ? `<p><strong>City:</strong> ${submission.city}</p>` : ""}
        
        <p><strong>Category:</strong> ${submission.category}</p>
        
        <p><strong>Description:</strong></p>
        <p>${submission.description}</p>
        
        <p><strong>Sensory Features:</strong></p>
        <ul>
          ${submission.sensoryFeatures.map((feature) => `<li>${feature}</li>`).join("")}
        </ul>
        
        ${submission.photoCount ? `<p><strong>Photos:</strong> ${submission.photoCount} uploaded</p>` : ""}
        
        <p>Please review and approve/reject this submission from the admin dashboard.</p>
      `,
    })

    if (error) {
      console.error("[v0] EMAIL_ERROR - Failed to send submission notification", error)
      return { success: false, error: error.message }
    }

    console.log("[v0] EMAIL_SUCCESS - Submission notification sent", { messageId: data?.id })
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error("[v0] EMAIL_ERROR - Exception sending submission notification", error)
    return { success: false, error: String(error) }
  }
}

export async function sendAdvertiseFormNotification(formData: {
  businessName: string
  contactName: string
  contactEmail: string
  contactPhone: string
  contactWebsite?: string
  eventTitle?: string
  description: string
  address?: string
  city?: string
  category: string
  sensoryFeatures: string[]
  isVenue?: boolean
  isEvent?: boolean
  isFeatured?: boolean
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log("[v0] EMAIL_SKIP - RESEND_API_KEY not configured")
    return { success: false, error: "Email service not configured" }
  }

  const adminEmail = process.env.BETA_NOTIFY_EMAIL || "tktoot1@yahoo.com"

  const submissionType = formData.isEvent ? "Event" : "Venue"

  console.log("[v0] EMAIL_SENDING - Advertise form submission", {
    to: adminEmail,
    type: submissionType,
    businessName: formData.businessName || formData.eventTitle,
  })

  try {
    const { data, error } = await resend.emails.send({
      from: "SensorySearch Advertise <onboarding@resend.dev>",
      to: [adminEmail],
      subject: `New Advertise Form: ${formData.businessName || formData.eventTitle}`,
      html: `
        <h2>New Advertise Form Submission</h2>
        <p><strong>Type:</strong> ${submissionType}${formData.isFeatured ? " (Featured)" : ""}</p>
        
        <h3>${formData.businessName || formData.eventTitle}</h3>
        
        <h4>Contact Information</h4>
        <p><strong>Name:</strong> ${formData.contactName}</p>
        <p><strong>Email:</strong> ${formData.contactEmail}</p>
        <p><strong>Phone:</strong> ${formData.contactPhone}</p>
        ${formData.contactWebsite ? `<p><strong>Website:</strong> ${formData.contactWebsite}</p>` : ""}
        
        ${formData.address ? `<p><strong>Address:</strong> ${formData.address}</p>` : ""}
        ${formData.city ? `<p><strong>City:</strong> ${formData.city}</p>` : ""}
        
        <p><strong>Category:</strong> ${formData.category}</p>
        
        <h4>Description</h4>
        <p>${formData.description}</p>
        
        <h4>Sensory Features</h4>
        <ul>
          ${formData.sensoryFeatures.map((feature) => `<li>${feature}</li>`).join("")}
        </ul>
        
        <p><em>This submission is pending review and payment processing.</em></p>
      `,
    })

    if (error) {
      console.error("[v0] EMAIL_ERROR - Failed to send advertise form notification", error)
      return { success: false, error: error.message }
    }

    console.log("[v0] EMAIL_SUCCESS - Advertise form notification sent", { messageId: data?.id })
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error("[v0] EMAIL_ERROR - Exception sending advertise form notification", error)
    return { success: false, error: String(error) }
  }
}

export async function sendApprovalNotification(
  submissionId: string,
  email: string,
  businessName: string,
  type: string,
) {
  if (!process.env.RESEND_API_KEY) {
    console.log("[v0] EMAIL_SKIP - RESEND_API_KEY not configured")
    return { success: false, error: "Email service not configured" }
  }

  console.log("[v0] EMAIL_SENDING - Approval notification", { to: email, businessName, type })

  try {
    const { data, error } = await resend.emails.send({
      from: "SensorySearch <onboarding@resend.dev>",
      to: [email],
      subject: `Your ${type} "${businessName}" has been approved!`,
      html: `
        <h2>Congratulations!</h2>
        <p>Your ${type} submission "${businessName}" has been approved and is now live on SensorySearch.</p>
        
        <p>Families in your area can now discover your ${type} when searching for sensory-friendly spaces.</p>
        
        <p>Thank you for making your space more accessible!</p>
        
        <p>Best regards,<br>The SensorySearch Team</p>
      `,
    })

    if (error) {
      console.error("[v0] EMAIL_ERROR - Failed to send approval notification", error)
      return { success: false, error: error.message }
    }

    console.log("[v0] EMAIL_SUCCESS - Approval notification sent", { messageId: data?.id })
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error("[v0] EMAIL_ERROR - Exception sending approval notification", error)
    return { success: false, error: String(error) }
  }
}

export async function sendRejectionNotification(
  submissionId: string,
  email: string,
  businessName: string,
  type: string,
  reason?: string,
) {
  if (!process.env.RESEND_API_KEY) {
    console.log("[v0] EMAIL_SKIP - RESEND_API_KEY not configured")
    return { success: false, error: "Email service not configured" }
  }

  console.log("[v0] EMAIL_SENDING - Rejection notification", { to: email, businessName, type })

  try {
    const { data, error } = await resend.emails.send({
      from: "SensorySearch <onboarding@resend.dev>",
      to: [email],
      subject: `Update on your ${type} submission "${businessName}"`,
      html: `
        <h2>Submission Update</h2>
        <p>Thank you for submitting "${businessName}" to SensorySearch.</p>
        
        <p>Unfortunately, we're unable to approve your ${type} at this time.</p>
        
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
        
        <p>If you have any questions or would like to resubmit, please contact us.</p>
        
        <p>Best regards,<br>The SensorySearch Team</p>
      `,
    })

    if (error) {
      console.error("[v0] EMAIL_ERROR - Failed to send rejection notification", error)
      return { success: false, error: error.message }
    }

    console.log("[v0] EMAIL_SUCCESS - Rejection notification sent", { messageId: data?.id })
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error("[v0] EMAIL_ERROR - Exception sending rejection notification", error)
    return { success: false, error: String(error) }
  }
}
