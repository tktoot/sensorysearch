import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendSubmissionNotification({
  type,
  title,
  description,
  submitterEmail,
  submissionId,
  images,
}: {
  type: string
  title: string
  description: string
  submitterEmail: string
  submissionId: string
  images: string[]
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log("[v0] EMAIL_SKIP: RESEND_API_KEY not configured")
    return
  }

  try {
    console.log("[v0] EMAIL_SENDING: Submission notification", {
      to: "tktoot1@yahoo.com",
      type,
      title,
      submitterEmail,
      submissionId,
      imageCount: images.length,
    })

    const { data, error } = await resend.emails.send({
      from: "SensorySearch <onboarding@resend.dev>",
      to: ["tktoot1@yahoo.com"],
      subject: `New ${type} Submission: ${title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Submission Received</h2>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Type:</strong> ${type}</p>
            <p><strong>Title:</strong> ${title}</p>
            <p><strong>Submitted by:</strong> ${submitterEmail}</p>
            <p><strong>Submission ID:</strong> ${submissionId}</p>
            <p><strong>Photos:</strong> ${images.length} image(s)</p>
          </div>

          <div style="margin: 20px 0;">
            <h3 style="color: #333;">Description:</h3>
            <p style="color: #666;">${description}</p>
          </div>

          ${images.length > 0 ? `
            <div style="margin: 20px 0;">
              <h3 style="color: #333;">Photos:</h3>
              <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                ${images.map(img => `<img src="${img}" style="width: 150px; height: 150px; object-fit: cover; border-radius: 4px;" />`).join('')}
              </div>
            </div>
          ` : ''}

          <div style="margin: 30px 0; padding: 20px; background: #e3f2fd; border-radius: 8px;">
            <p style="margin: 0;"><strong>Action Required:</strong> Review and approve/reject this submission in your admin dashboard.</p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error("[v0] EMAIL_ERROR:", error)
      throw error
    }

    console.log("[v0] EMAIL_SUCCESS:", { messageId: data?.id })
    return data
  } catch (error) {
    console.error("[v0] EMAIL_ERROR: Failed to send submission notification:", error)
    throw error
  }
}

export async function sendApprovalNotification({
  email,
  title,
  type,
}: {
  email: string
  title: string
  type: string
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log("[v0] EMAIL_SKIP: RESEND_API_KEY not configured")
    return
  }

  try {
    console.log("[v0] EMAIL_SENDING: Approval notification", { to: email, title, type })

    const { data, error } = await resend.emails.send({
      from: "SensorySearch <onboarding@resend.dev>",
      to: [email],
      subject: `Your ${type} listing has been approved!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">Congratulations! Your Listing is Live</h2>
          
          <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Title:</strong> ${title}</p>
            <p><strong>Type:</strong> ${type}</p>
          </div>

          <p style="color: #666;">Your submission has been reviewed and approved! It's now live on SensorySearch and visible to all users.</p>

          <p style="color: #666; margin-top: 20px;">Thank you for contributing to our sensory-friendly community!</p>
        </div>
      `,
    })

    if (error) {
      console.error("[v0] EMAIL_ERROR:", error)
      throw error
    }

    console.log("[v0] EMAIL_SUCCESS:", { messageId: data?.id })
    return data
  } catch (error) {
    console.error("[v0] EMAIL_ERROR: Failed to send approval notification:", error)
    throw error
  }
}

export async function sendRejectionNotification({
  email,
  title,
  type,
  reason,
}: {
  email: string
  title: string
  type: string
  reason?: string
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log("[v0] EMAIL_SKIP: RESEND_API_KEY not configured")
    return
  }

  try {
    console.log("[v0] EMAIL_SENDING: Rejection notification", { to: email, title, type, hasReason: !!reason })

    const { data, error } = await resend.emails.send({
      from: "SensorySearch <onboarding@resend.dev>",
      to: [email],
      subject: `Update on your ${type} submission`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f44336;">Submission Update</h2>
          
          <div style="background: #ffebee; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Title:</strong> ${title}</p>
            <p><strong>Type:</strong> ${type}</p>
          </div>

          <p style="color: #666;">Unfortunately, your submission did not meet our current listing criteria.</p>

          ${reason ? `
            <div style="background: #f5f5f5; padding: 15px; border-left: 4px solid #f44336; margin: 20px 0;">
              <p style="margin: 0; color: #333;"><strong>Reason:</strong></p>
              <p style="margin: 10px 0 0 0; color: #666;">${reason}</p>
            </div>
          ` : ''}

          <p style="color: #666; margin-top: 20px;">You're welcome to submit again with updated information. If you have questions, please contact us.</p>
        </div>
      `,
    })

    if (error) {
      console.error("[v0] EMAIL_ERROR:", error)
      throw error
    }

    console.log("[v0] EMAIL_SUCCESS:", { messageId: data?.id })
    return data
  } catch (error) {
    console.error("[v0] EMAIL_ERROR: Failed to send rejection notification:", error)
    throw error
  }
}

export async function sendAdvertiseFormNotification({
  businessName,
  contactName,
  contactEmail,
  contactPhone,
  contactWebsite,
  eventTitle,
  description,
  address,
  city,
  category,
  sensoryFeatures,
  isVenue,
  isEvent,
  isFeatured,
}: {
  businessName?: string
  contactName: string
  contactEmail: string
  contactPhone?: string
  contactWebsite?: string
  eventTitle?: string
  description: string
  address?: string
  city?: string
  category?: string
  sensoryFeatures: string[]
  isVenue?: boolean
  isEvent?: boolean
  isFeatured?: boolean
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log("[v0] EMAIL_SKIP: RESEND_API_KEY not configured")
    return { success: false, error: "RESEND_API_KEY not configured" }
  }

  try {
    console.log("[v0] EMAIL_SENDING: Advertise form notification", {
      to: "tktoot1@yahoo.com",
      contactEmail,
      businessName,
      isVenue,
      isEvent,
      isFeatured,
    })

    const listingType = isEvent ? "Event" : isVenue ? "Business Venue" : "Listing"
    const subject = isFeatured 
      ? `🌟 Featured ${listingType} Inquiry from ${contactName}`
      : `New ${listingType} Inquiry from ${contactName}`

    const { data, error } = await resend.emails.send({
      from: "SensorySearch <onboarding@resend.dev>",
      to: ["tktoot1@yahoo.com"],
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">${isFeatured ? '🌟 ' : ''}New Advertise Form Submission</h2>
          
          <div style="background: ${isFeatured ? '#fff3cd' : '#f5f5f5'}; padding: 20px; border-radius: 8px; margin: 20px 0; ${isFeatured ? 'border: 2px solid #ffc107;' : ''}">
            <h3 style="margin-top: 0; color: #333;">Contact Information</h3>
            <p><strong>Name:</strong> ${contactName}</p>
            <p><strong>Email:</strong> ${contactEmail}</p>
            ${contactPhone ? `<p><strong>Phone:</strong> ${contactPhone}</p>` : ''}
            ${contactWebsite ? `<p><strong>Website:</strong> <a href="${contactWebsite}">${contactWebsite}</a></p>` : ''}
          </div>

          ${businessName ? `
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">Business Information</h3>
              <p><strong>Business Name:</strong> ${businessName}</p>
              ${eventTitle ? `<p><strong>Event Title:</strong> ${eventTitle}</p>` : ''}
            </div>
          ` : ''}

          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Listing Details</h3>
            <p><strong>Type:</strong> ${listingType}</p>
            ${category ? `<p><strong>Category:</strong> ${category}</p>` : ''}
            ${address ? `<p><strong>Address:</strong> ${address}</p>` : ''}
            ${city ? `<p><strong>City:</strong> ${city}</p>` : ''}
            ${isFeatured ? '<p><strong>Featured:</strong> ✅ Yes</p>' : ''}
          </div>

          <div style="margin: 20px 0;">
            <h3 style="color: #333;">Description:</h3>
            <p style="color: #666; white-space: pre-wrap;">${description}</p>
          </div>

          ${sensoryFeatures && sensoryFeatures.length > 0 ? `
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">Sensory Features:</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                ${sensoryFeatures.map(feature => `<li style="color: #666; margin: 5px 0;">${feature}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <div style="margin: 30px 0; padding: 20px; background: #e8f5e9; border-radius: 8px;">
            <p style="margin: 0;"><strong>Action Required:</strong> Follow up with this advertiser via email at ${contactEmail}</p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error("[v0] EMAIL_ERROR:", error)
      return { success: false, error: error.message }
    }

    console.log("[v0] EMAIL_SUCCESS:", { messageId: data?.id })
    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error("[v0] EMAIL_ERROR: Failed to send advertise form notification:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }
  }
}
