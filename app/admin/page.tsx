"use client"

import { useEffect, useState } from "react"
import { AdminDashboard } from "@/components/admin-dashboard"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { ADMIN_EMAILS } from "@/lib/config"

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function checkAdmin() {
      console.log("[v0] ADMIN_PAGE: Checking admin access...")
      const supabase = createClient()
      
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        console.log("[v0] ADMIN_PAGE: No user found, redirecting...")
        router.replace("/intro")
        return
      }

      const userEmail = user.email?.toLowerCase() || ""
      const adminEmailsList = ADMIN_EMAILS.map(e => e.toLowerCase())
      const hasAdminAccess = adminEmailsList.includes(userEmail)
      
      console.log("[v0] ADMIN_PAGE: Access check", {
        userEmail,
        adminEmails: adminEmailsList,
        hasAccess: hasAdminAccess
      })

      if (!hasAdminAccess) {
        console.log("[v0] ADMIN_PAGE: Not an admin, redirecting...")
        router.replace("/")
        return
      }

      console.log("[v0] ADMIN_PAGE: Admin access granted!")
      setIsAdmin(true)
    }

    checkAdmin()
  }, [router])

  if (isAdmin === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return <AdminDashboard />
}
