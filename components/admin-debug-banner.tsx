"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { DEBUG_ADMIN_EMAILS } from "@/lib/config"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { X, ChevronDown, ChevronUp, Shield } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface DebugInfo {
  authState: "authenticated" | "anonymous" | "loading"
  userId: string | null
  email: string | null
  hasProfile: boolean
  role: string | null
  env: string
}

export function AdminDebugBanner() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    authState: "loading",
    userId: null,
    email: null,
    hasProfile: false,
    role: null,
    env: process.env.NODE_ENV || "development",
  })
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const checkDebugAccess = async () => {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        const userEmail = session.user.email?.toLowerCase()

        // Check if user is in DEBUG_ADMIN_EMAILS
        if (userEmail && DEBUG_ADMIN_EMAILS.includes(userEmail)) {
          // Fetch user profile
          const { data: userData } = await supabase.from("users").select("role").eq("id", session.user.id).single()

          setDebugInfo({
            authState: "authenticated",
            userId: session.user.id,
            email: session.user.email || null,
            hasProfile: !!userData,
            role: userData?.role || null,
            env: process.env.NODE_ENV || "development",
          })
          setIsVisible(true)
        }
      }
    }

    checkDebugAccess()
  }, [])

  if (!isVisible) return null

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80 border-2 border-purple-500 bg-purple-50 dark:bg-purple-950/50 shadow-lg">
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Link href="/admin" className="hover:opacity-80 transition-opacity">
              <Badge variant="secondary" className="bg-purple-600 text-white flex items-center gap-1 cursor-pointer">
                <Shield className="h-3 w-3" />
                ADMIN MODE
              </Badge>
            </Link>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setIsVisible(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {isExpanded && (
          <div className="space-y-1 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Auth:</span>
              <span className="font-semibold">{debugInfo.authState}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">User ID:</span>
              <span className="font-semibold truncate max-w-[180px]" title={debugInfo.userId || "none"}>
                {debugInfo.userId ? `${debugInfo.userId.slice(0, 8)}...` : "none"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-semibold truncate max-w-[180px]" title={debugInfo.email || "none"}>
                {debugInfo.email || "none"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Profile:</span>
              <span className="font-semibold">{debugInfo.hasProfile ? "Yes" : "No"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role:</span>
              <span className="font-semibold">{debugInfo.role || "none"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Env:</span>
              <span className="font-semibold">{debugInfo.env}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
