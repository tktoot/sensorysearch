"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SubmitEventRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/advertise")
  }, [router])

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <p className="text-muted-foreground">Redirecting to Advertise page...</p>
    </div>
  )
}
