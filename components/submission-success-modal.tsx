"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

interface SubmissionSuccessModalProps {
  open: boolean
  onClose: () => void
  type: "venue" | "event" | "park" | "playground" | "place_of_worship"
}

export function SubmissionSuccessModal({ open, onClose, type }: SubmissionSuccessModalProps) {
  const typeLabel = {
    venue: "Venue",
    event: "Event",
    park: "Park/Playground",
    playground: "Park/Playground",
    place_of_worship: "Place of Worship",
  }[type]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <DialogTitle className="text-center">Submission Received!</DialogTitle>
          <DialogDescription className="text-center">
            Thank you for submitting your <strong>{typeLabel}</strong>. It has been received and is pending review by
            our team. You'll be notified once it's approved and published.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3">
          <Button onClick={onClose} className="flex-1">
            Submit Another
          </Button>
          <Button onClick={() => (window.location.href = "/discover")} variant="outline" className="flex-1">
            View Discover Page
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
