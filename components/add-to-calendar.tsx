"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, Download } from "lucide-react"

interface AddToCalendarProps {
  eventName: string
  eventDescription: string
  location: string
  startDate: Date
  endDate: Date
}

export function AddToCalendar({ eventName, eventDescription, location, startDate, endDate }: AddToCalendarProps) {
  const formatDateForGoogle = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, "")
  }

  const formatDateForICS = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, "")
  }

  const handleGoogleCalendar = () => {
    const start = formatDateForGoogle(startDate)
    const end = formatDateForGoogle(endDate)
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      eventName,
    )}&dates=${start}/${end}&details=${encodeURIComponent(eventDescription)}&location=${encodeURIComponent(location)}`
    window.open(url, "_blank")
  }

  const handleOutlookWeb = () => {
    const start = startDate.toISOString()
    const end = endDate.toISOString()
    const url = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(
      eventName,
    )}&startdt=${start}&enddt=${end}&body=${encodeURIComponent(eventDescription)}&location=${encodeURIComponent(
      location,
    )}`
    window.open(url, "_blank")
  }

  const handleAppleICS = () => {
    const start = formatDateForICS(startDate)
    const end = formatDateForICS(endDate)

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${eventName}`,
      `DESCRIPTION:${eventDescription}`,
      `LOCATION:${location}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\n")

    const blob = new Blob([icsContent], { type: "text/calendar" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${eventName.replace(/\s+/g, "-")}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Calendar className="h-4 w-4" />
          Add to Calendar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleGoogleCalendar} className="cursor-pointer">
          Google Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleOutlookWeb} className="cursor-pointer">
          Outlook Web
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleAppleICS} className="cursor-pointer gap-2">
          <Download className="h-4 w-4" />
          Apple Calendar / ICS
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
