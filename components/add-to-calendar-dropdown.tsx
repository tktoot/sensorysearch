"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Calendar, ChevronDown, Bell } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  generateGoogleCalendarLink,
  generateOutlookLink,
  downloadIcsFile,
  type CalendarEvent,
} from "@/lib/calendar-utils"

interface AddToCalendarDropdownProps {
  event: CalendarEvent
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
  className?: string
}

export function AddToCalendarDropdown({
  event,
  variant = "outline",
  size = "default",
  className,
}: AddToCalendarDropdownProps) {
  const [addReminder, setAddReminder] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleGoogleCalendar = () => {
    const link = generateGoogleCalendarLink(event, addReminder)
    window.open(link, "_blank")
    setIsOpen(false)
  }

  const handleOutlook = () => {
    const link = generateOutlookLink(event, addReminder)
    window.open(link, "_blank")
    setIsOpen(false)
  }

  const handleAppleCalendar = async () => {
    try {
      const { content, filename, mimeType } = await downloadIcsFile(event, addReminder)

      // Create blob and download
      const blob = new Blob([content], { type: mimeType })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      setIsOpen(false)
    } catch (error) {
      console.error("Failed to download ICS file:", error)
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Calendar className="h-4 w-4 mr-2" />
          Add to Calendar
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-2 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="reminder" className="text-sm font-normal cursor-pointer">
                Remind me 1 day before
              </Label>
            </div>
            <Switch id="reminder" checked={addReminder} onCheckedChange={setAddReminder} />
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleGoogleCalendar} className="cursor-pointer">
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12c6.627 0 12-5.373 12-12S18.627 0 12 0zm5.696 16.481c-1.19 1.19-2.79 1.846-4.696 1.846-1.907 0-3.507-.656-4.696-1.846C7.114 15.291 6.458 13.691 6.458 11.784c0-1.906.656-3.506 1.846-4.696C9.493 5.898 11.093 5.242 12 5.242c1.906 0 3.506.656 4.696 1.846.363.363.656.763.907 1.19l-1.846 1.846c-.363-.656-.907-1.19-1.657-1.553-.656-.363-1.407-.544-2.1-.544-1.19 0-2.244.437-3.144 1.337-.9.9-1.337 1.954-1.337 3.144 0 1.19.437 2.244 1.337 3.144.9.9 1.954 1.337 3.144 1.337 1.19 0 2.244-.437 3.144-1.337.544-.544.907-1.19 1.19-1.954h-4.334v-2.607h7.304c.073.363.11.763.11 1.19 0 1.907-.656 3.507-1.846 4.697z" />
          </svg>
          Add to Google Calendar
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleOutlook} className="cursor-pointer">
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 7.387v9.226c0 .747-.606 1.353-1.353 1.353H1.353C.606 17.966 0 17.36 0 16.613V7.387c0-.747.606-1.353 1.353-1.353h21.294c.747 0 1.353.606 1.353 1.353zM12 13.032l-9.428-6.03h18.856L12 13.032zm-9.6 3.934h19.2v-8.4L12 14.4 2.4 8.566v8.4z" />
          </svg>
          Add to Outlook
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleAppleCalendar} className="cursor-pointer">
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          Add to Apple Calendar (ICS)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
