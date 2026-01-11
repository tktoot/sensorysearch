import { BETA_NOTIFY_EMAIL } from "@/lib/config"
import type { SubmissionNotificationData } from "@/lib/types"

/**
 * Send email notification when a new submission is created
 * During beta, this logs to console. In production, use Resend API.
 */
export async function sendSubmissionNotification(data: SubmissionNotificationData): Promise<boolean> {
  try {
    // During beta, just log the notification
    console.log("[v0] EMAIL_NOTIFICATION - New submission", {
      to: BETA_NOTIFY_EMAIL,
      subject: `New ${data.type} Submission: ${data.title}`,
      submitter: data.submitterEmail,
      submissionId: data.submissionId,
      images: data.images?.length || 0,
    })

    // TODO: In production, send actual email via Resend
    // const resend = new Resend(process.env.RESEND_API_KEY)
    // await resend.emails.send({
    //   from: 'notifications@sensorysearch.app',
    //   to: BETA_NOTIFY_EMAIL,
    //   subject: `New ${data.type} Submission: ${data.title}`,
    //   html: `...email template...`
    // })

    return true
  } catch (error) {
    console.error("[v0] Email notification error:", error)
    return false
  }
}

/**
 * Send email notification when a submission is approved
 */
export async function sendApprovalNotification(submitterEmail: string, title: string, type: string): Promise<boolean> {
  try {
    console.log("[v0] EMAIL_NOTIFICATION - Submission approved", {
      to: submitterEmail,
      subject: `Your ${type} "${title}" has been approved!`,
    })

    // TODO: Implement actual email sending
    return true
  } catch (error) {
    console.error("[v0] Approval email error:", error)
    return false
  }
}

/**
 * Send email notification when a submission is rejected
 */
export async function sendRejectionNotification(
  submitterEmail: string,
  title: string,
  type: string,
  reason?: string,
): Promise<boolean> {
  try {
    console.log("[v0] EMAIL_NOTIFICATION - Submission rejected", {
      to: submitterEmail,
      subject: `Update on your ${type} submission`,
      reason,
    })

    // TODO: Implement actual email sending
    return true
  } catch (error) {
    console.error("[v0] Rejection email error:", error)
    return false
  }
}
