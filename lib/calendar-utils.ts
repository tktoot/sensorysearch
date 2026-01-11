import type { Event } from "@/lib/mock-data"

export interface CalendarEvent {
  title: string
  startDateTime: string // ISO 8601
  endDateTime: string // ISO 8601
  timezone?: string
  location: string
  description: string
  eventUrl?: string
  organizerName?: string
}

/**
 * Convert Event to CalendarEvent format
 */
export function eventToCalendarEvent(event: Event): CalendarEvent {
  // Parse date and time
  const startDate = new Date(`${event.date}T${convertTo24Hour(event.time)}`)

  // Default to 2 hours duration if not specified
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000)

  return {
    title: event.name,
    startDateTime: startDate.toISOString(),
    endDateTime: endDate.toISOString(),
    timezone: "America/New_York", // Default timezone
    location: event.venueName,
    description: event.description,
    eventUrl: typeof window !== "undefined" ? window.location.href : "",
    organizerName: event.businessEmail?.split("@")[0],
  }
}

/**
 * Convert 12-hour time format to 24-hour format
 */
function convertTo24Hour(time: string): string {
  const match = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  if (!match) return "12:00:00"

  const [, hours, minutes, period] = match
  let hour = Number.parseInt(hours, 10)

  if (period.toUpperCase() === "PM" && hour !== 12) {
    hour += 12
  } else if (period.toUpperCase() === "AM" && hour === 12) {
    hour = 0
  }

  return `${hour.toString().padStart(2, "0")}:${minutes}:00`
}

/**
 * Format date for Google Calendar (YYYYMMDDTHHmmssZ)
 */
function formatGoogleDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
}

/**
 * Generate Google Calendar link
 */
export function generateGoogleCalendarLink(event: CalendarEvent, addReminder = false): string {
  const startDate = new Date(event.startDateTime)
  const endDate = new Date(event.endDateTime)

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`,
    details: `${event.description}\n\n${event.eventUrl || ""}`,
    location: event.location,
    ctz: event.timezone || "America/New_York",
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/**
 * Generate Outlook Web link
 */
export function generateOutlookLink(event: CalendarEvent, addReminder = false): string {
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    subject: event.title,
    startdt: event.startDateTime,
    enddt: event.endDateTime,
    body: `${event.description}\n\n${event.eventUrl || ""}`,
    location: event.location,
  })

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`
}

/**
 * Generate ICS file content
 */
export async function generateIcs(event: CalendarEvent, addReminder = false): Promise<string> {
  const startDate = new Date(event.startDateTime)
  const endDate = new Date(event.endDateTime)

  const formatIcsDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
  }

  const now = new Date()
  const dtstamp = formatIcsDate(now)

  // Calculate reminder time (1 day before)
  const reminderDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000)

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CalmSeek//Event Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.title.replace(/\s+/g, "-")}-${startDate.getTime()}@sensorysearch.com`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${formatIcsDate(startDate)}`,
    `DTEND:${formatIcsDate(endDate)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description}\\n\\n${event.eventUrl || ""}`,
    `LOCATION:${event.location}`,
  ]

  if (event.organizerName) {
    icsContent.push(`ORGANIZER;CN=${event.organizerName}:mailto:${event.organizerName}@sensorysearch.com`)
  }

  if (addReminder) {
    icsContent.push(
      "BEGIN:VALARM",
      "TRIGGER:-P1D",
      "ACTION:DISPLAY",
      `DESCRIPTION:Reminder: ${event.title} tomorrow`,
      "END:VALARM",
    )
  }

  icsContent.push("END:VEVENT", "END:VCALENDAR")

  return icsContent.join("\r\n")
}

/**
 * Server action to download ICS file
 */
export async function downloadIcsFile(event: CalendarEvent, addReminder = false) {
  const icsContent = await generateIcs(event, addReminder)

  return {
    content: icsContent,
    filename: `${event.title.replace(/\s+/g, "-")}.ics`,
    mimeType: "text/calendar",
  }
}
