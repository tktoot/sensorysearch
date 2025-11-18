"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, Heart, User, Megaphone, BookOpen, Shield } from "lucide-react"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { getGuestFavorites } from "@/lib/guest-store"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"

export function BottomTabBar() {
  const pathname = usePathname()
  const [showAdvertiseMenu, setShowAdvertiseMenu] = useState(false)
  const [favoritesCount, setFavoritesCount] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

          setUserRole(userData?.role || "user")
        }
      } catch (error) {
        console.error("[v0] Failed to check user role:", error)
        // Silently fail - user will just not see admin tab
      }
    }

    checkUserRole()
  }, [])

  useEffect(() => {
    const updateFavoritesCount = () => {
      const favorites = getGuestFavorites()
      setFavoritesCount(favorites.length)
    }

    updateFavoritesCount()

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "sensory_search_guest_profile") {
        updateFavoritesCount()
      }
    }

    window.addEventListener("storage", handleStorageChange)

    const handleFavoriteToggle = () => {
      updateFavoritesCount()
    }
    window.addEventListener("favoriteToggled", handleFavoriteToggle)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("favoriteToggled", handleFavoriteToggle)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY && currentScrollY > 20) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        setIsKeyboardOpen(true)
      }
    }

    const handleFocusOut = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        setIsKeyboardOpen(false)
      }
    }

    document.addEventListener("focusin", handleFocusIn)
    document.addEventListener("focusout", handleFocusOut)

    return () => {
      document.removeEventListener("focusin", handleFocusIn)
      document.removeEventListener("focusout", handleFocusOut)
    }
  }, [])

  const tabs = [
    { href: "/discover", label: "Discover", icon: Home },
    { href: "advertise-menu", label: "Advertise", icon: Megaphone, isMenu: true },
    { href: "/resources", label: "Resources", icon: BookOpen },
    { href: "/favorites", label: "Favorites", icon: Heart, badge: favoritesCount },
    ...(userRole === "admin" ? [{ href: "/admin", label: "Admin", icon: Shield }] : []),
    { href: "/profile", label: "Profile", icon: User },
  ]

  const advertiseMenuItems = [
    { href: "/advertise?type=event", label: "List an Event", description: "Paid listing" },
    { href: "/advertise?type=venue", label: "List a Venue", description: "Paid listing" },
    { href: "/submit-community-venue", label: "List a Park/Playground", description: "Free listing" },
  ]

  const isActive = (href: string) => {
    if (href === "advertise-menu") {
      return pathname?.startsWith("/advertise") || pathname === "/submit-community-venue"
    }
    return pathname === href || pathname?.startsWith(href)
  }

  const handleTabClick = (tab: (typeof tabs)[0]) => {
    if (tab.isMenu) {
      setShowAdvertiseMenu(true)
    }
  }

  return (
    <>
      <nav
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 md:hidden ${
          isVisible && !isKeyboardOpen ? "translate-y-0" : "translate-y-full"
        }`}
        role="navigation"
        aria-label="Main navigation"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-2 mb-2 rounded-t-2xl border border-border bg-card/95 shadow-lg backdrop-blur-xl supports-[backdrop-filter]:bg-card/80">
          <div className="flex items-center justify-around px-2 py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const active = isActive(tab.href)

              if (tab.isMenu) {
                return (
                  <button
                    key={tab.href}
                    onClick={() => handleTabClick(tab)}
                    className={`relative flex min-w-[44px] flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 transition-colors ${
                      active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                    aria-label={tab.label}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon className={`h-5 w-5 ${active ? "fill-primary" : ""}`} />
                    <span className="text-xs font-medium">{tab.label}</span>
                  </button>
                )
              }

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`relative flex min-w-[44px] flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 transition-colors ${
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-label={tab.label}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className={`h-5 w-5 ${active ? "fill-primary" : ""}`} />
                  <span className="text-xs font-medium">{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
                    >
                      {tab.badge > 99 ? "99+" : tab.badge}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      <Sheet open={showAdvertiseMenu} onOpenChange={setShowAdvertiseMenu}>
        <SheetContent side="bottom" className="h-auto rounded-t-2xl">
          <SheetHeader className="text-left">
            <SheetTitle className="text-2xl font-heading">For Businesses</SheetTitle>
            <SheetDescription>Share your sensory-friendly offerings with families who need them</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-2">
            {advertiseMenuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setShowAdvertiseMenu(false)}
                className="flex items-start gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent"
              >
                <div className="flex-1">
                  <h3 className="font-semibold">{item.label}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
