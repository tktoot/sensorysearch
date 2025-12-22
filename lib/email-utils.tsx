import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const ADMIN_EMAIL = process.env.BETA_NOTIFY_EMAIL || "tktoot1@yahoo.com"

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
  console.log("[v0] EMAIL: Sending submission notification", {
    to: ADMIN_EMAIL,
    type,
    title,
    submissionId,
  })

  try {
    const { data, error } = await resend.emails.send({
      from: "SensorySearch <notifications@sensorysearch.com>",
      to: [ADMIN_EMAIL],
      subject: `New ${type} submission: ${title}`,
      html: `
        <h2>New ${type} Submission</h2>
        <p><strong>Title:</strong> ${title}</p>
        <p><strong>Submitter:</strong> ${submitterEmail}</p>
        <p><strong>Submission ID:</strong> ${submissionId}</p>
        <p><strong>Description:</strong></p>
        <p>${description}</p>
        ${images.length > 0 ? `<p><strong>Images:</strong> ${images.length} photo(s) uploaded</p>` : ""}
        <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin">Review in Admin Portal</a></p>
      `,
    })

    if (error) {
      console.error("[v0] EMAIL_ERROR:", error)
      throw error
    }

    console.log("[v0] EMAIL_SENT:", data)
    return data
  } catch (error) {
    console.error("[v0] EMAIL_FAILED:", error)
    throw error
  }
}

export async function sendApprovalNotification({
  type,
  title,
  recipientEmail,
  listingUrl,
}: {
  type: string
  title: string
  recipientEmail: string
  listingUrl: string
}) {
  console.log("[v0] EMAIL: Sending approval notification", {
    to: recipientEmail,
    type,
    title,
  })

  try {
    const { data, error } = await resend.emails.send({
      from: "SensorySearch <notifications@sensorysearch.com>",
      to: [recipientEmail],
      subject: `Your ${type} "${title}" has been approved!`,
      html: `
        <h2>Congratulations!</h2>
        <p>Your ${type} submission "<strong>${title}</strong>" has been approved and is now live on SensorySearch.</p>
        <p><a href="${listingUrl}">View your listing</a></p>
        <p>Thank you for contributing to our sensory-friendly community!</p>
      `,
    })

    if (error) {
      console.error("[v0] EMAIL_ERROR:", error)
      throw error
    }

    console.log("[v0] EMAIL_SENT:", data)
    return data
  } catch (error) {
    console.error("[v0] EMAIL_FAILED:", error)
    throw error
  }
}

export async function sendRejectionNotification({
  type,
  title,
  recipientEmail,
  reason,
}: {
  type: string
  title: string
  recipientEmail: string
  reason?: string
}) {
  console.log("[v0] EMAIL: Sending rejection notification", {
    to: recipientEmail,
    type,
    title,
  })

  try {
    const { data, error } = await resend.emails.send({
      from: "SensorySearch <notifications@sensorysearch.com>",
      to: [recipientEmail],
      subject: `Update on your ${type} submission: ${title}`,
      html: `
        <h2>Submission Update</h2>
        <p>Thank you for your ${type} submission "<strong>${title}</strong>".</p>
        <p>Unfortunately, we're unable to approve it at this time.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
        <p>If you have questions, please contact us at ${ADMIN_EMAIL}.</p>
      `,
    })

    if (error) {
      console.error("[v0] EMAIL_ERROR:", error)
      throw error
    }

    console.log("[v0] EMAIL_SENT:", data)
    return data
  } catch (error) {
    console.error("[v0] EMAIL_FAILED:", error)
    throw error
  }
}

export async function sendAdvertiseFormNotification({
  businessName,
  contactName,
  contactEmail,
  phone,
  description,
  sensoryFeatures,
}: {
  businessName: string
  contactName: string
  contactEmail: string
  phone?: string
  description: string
  sensoryFeatures?: string[]
}) {
  console.log("[v0] EMAIL: Sending advertise form notification", {
    to: ADMIN_EMAIL,
    businessName,
    contactEmail,
  })

  try {
    const { data, error } = await resend.emails.send({
      from: "SensorySearch <notifications@sensorysearch.com>",
      to: [ADMIN_EMAIL],
      subject: `New Advertising Inquiry: ${businessName}`,
      html: `
        <h2>New Advertising Form Submission</h2>
        <p><strong>Business Name:</strong> ${businessName}</p>
        <p><strong>Contact Name:</strong> ${contactName}</p>
        <p><strong>Contact Email:</strong> ${contactEmail}</p>
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
        <p><strong>Description:</strong></p>
        <p>${description}</p>
        ${
          sensoryFeatures && sensoryFeatures.length > 0
            ? `<p><strong>Sensory Features:</strong> ${sensoryFeatures.join(", ")}</p>`
            : ""
        }
      `,
    })

    if (error) {
      console.error("[v0] EMAIL_ERROR:", error)
      throw error
    }

    console.log("[v0] EMAIL_SENT:", data)
    return data
  } catch (error) {
    console.error("[v0] EMAIL_FAILED:", error)
    throw error
  }
}
