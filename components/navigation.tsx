"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MoreVertical, Info, Play, Search, Mail, Scale, ChevronRight, Shield } from "lucide-react"
import Image from "next/image"
import { getCurrentUser, type UserRole } from "@/lib/auth-utils"
import type { UserProfile } from "@/lib/mock-data"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { SearchOverlay } from "@/components/search-overlay"

export function Navigation() {
  const pathname = usePathname()
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [showGetStarted, setShowGetStarted] = useState(false)
  const [showOverflowMenu, setShowOverflowMenu] = useState(false)
  const [showSearchOverlay, setShowSearchOverlay] = useState(false)
  const [showLegalSubmenu, setShowLegalSubmenu] = useState(false)

  useEffect(() => {
    const user = getCurrentUser()
    setUserRole(user?.role || null)

    const savedProfile = localStorage.getItem("userProfile")
    if (savedProfile) {
      const profile: UserProfile = JSON.parse(savedProfile)
      if (!profile.name || !profile.email || !profile.agePreference) {
        setShowGetStarted(true)
      }
    } else {
      setShowGetStarted(true)
    }
  }, [pathname])

  const overflowMenuItems = [
    { href: "/about", label: "About SensorySearch", icon: Info, description: "Our mission and story" },
    {
      label: "Legal",
      icon: Scale,
      description: "Privacy, terms, and policies",
      submenu: [
        { href: "/legal/privacy", label: "Privacy Policy" },
        { href: "/legal/terms", label: "Terms of Service" },
        { href: "/legal/refund-and-advertising", label: "Refund & Advertising Policy" },
      ],
    },
    { href: "/contact", label: "Contact", icon: Mail, description: "Get in touch with us" },
    {
      href: "/intro",
      label: "Replay Intro",
      icon: Play,
      description: "See the welcome tour again",
      onClick: () => {
        localStorage.removeItem("introCompleted")
        console.log("[v0] Cleared intro flag, replaying intro")
      },
    },
  ]

  // Add Admin item if user is admin
  if (userRole === "admin") {
    overflowMenuItems.unshift({
      href: "/admin",
      label: "Admin",
      icon: Shield,
      description: "Manage submissions and users",
    })
  }

  const handleSearchOpen = () => {
    console.log("[Analytics] search_opened")
    setShowSearchOverlay(true)
  }

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto px-4">
          <div className="flex h-14 items-center justify-between">
            {/* Logo - Left */}
            <Link href="/discover" className="flex items-center gap-2" aria-label="SensorySearch home">
              <div className="relative h-7 w-7 p-1">
                <Image
                  src="/branding/sensory-search-icon.png"
                  alt="SensorySearch logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>

            {/* Title - Center */}
            <h1 className="text-lg font-heading font-semibold bg-gradient-to-r from-[#5BC0BE] via-[#C8A2C8] to-[#F8E9A1] bg-clip-text text-transparent">
              SensorySearch
            </h1>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSearchOpen}
                aria-label="Search venues and events"
                className="h-10 w-10"
              >
                <Search className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowOverflowMenu(true)}
                aria-label="More options"
                className="h-10 w-10"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <SearchOverlay open={showSearchOverlay} onOpenChange={setShowSearchOverlay} />

      <Sheet open={showOverflowMenu} onOpenChange={setShowOverflowMenu}>
        <SheetContent side="bottom" className="h-auto rounded-t-2xl">
          <SheetHeader className="text-left">
            <SheetTitle className="text-2xl font-heading">More</SheetTitle>
            <SheetDescription>Additional options and information</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-2">
            {overflowMenuItems.map((item) => {
              const Icon = item.icon

              // Legal item with submenu
              if (item.submenu) {
                return (
                  <div key={item.label}>
                    <button
                      onClick={() => setShowLegalSubmenu(!showLegalSubmenu)}
                      className="flex w-full items-start gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent"
                      aria-expanded={showLegalSubmenu}
                      aria-label="Legal menu"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-semibold">{item.label}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <ChevronRight className={`h-5 w-5 transition-transform ${showLegalSubmenu ? "rotate-90" : ""}`} />
                    </button>

                    {showLegalSubmenu && (
                      <div className="ml-14 mt-2 space-y-2">
                        {item.submenu.map((subitem) => (
                          <Link
                            key={subitem.href}
                            href={subitem.href}
                            onClick={() => {
                              console.log(`[Analytics] legal_opened page: ${subitem.href.split("/").pop()}`)
                              setShowOverflowMenu(false)
                              setShowLegalSubmenu(false)
                            }}
                            className="block rounded-lg border border-border bg-card/50 p-3 text-sm transition-colors hover:bg-accent"
                          >
                            {subitem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }

              // Regular menu items (including Admin if user is admin)
              return (
                <Link
                  key={item.href}
                  href={item.href!}
                  onClick={() => {
                    if ("onClick" in item && item.onClick) {
                      item.onClick()
                    }
                    if (item.href === "/contact") {
                      console.log("[Analytics] contact_opened")
                    }
                    if (item.href === "/admin") {
                      console.log("[Analytics] admin_opened")
                    }
                    setShowOverflowMenu(false)
                  }}
                  className="flex items-start gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent"
                  aria-label={item.label}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.label}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
