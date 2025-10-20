"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { X, Search, Calendar, MapPin, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { mockEvents, mockVenues } from "@/lib/mock-data"

interface SearchOverlayProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialQuery?: string
  initialType?: "all" | "events" | "venues"
}

type SearchResult = {
  id: string
  title: string
  subtitle: string
  type: "event" | "venue"
  href: string
}

export function SearchOverlay({ open, onOpenChange, initialQuery = "", initialType = "all" }: SearchOverlayProps) {
  const [query, setQuery] = useState(initialQuery)
  const [activeTab, setActiveTab] = useState<"all" | "events" | "venues">(initialType)
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const debounceTimerRef = useRef<NodeJS.Timeout>()

  const performSearch = useCallback((searchQuery: string, type: "all" | "events" | "venues") => {
    if (searchQuery.length < 2) {
      setResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    console.log("[Analytics] search_query", { query: searchQuery, type })

    const lowerQuery = searchQuery.toLowerCase()
    const searchResults: SearchResult[] = []

    // Search events
    if (type === "all" || type === "events") {
      const matchingEvents = mockEvents.filter(
        (event) =>
          event.name.toLowerCase().includes(lowerQuery) ||
          event.venueName.toLowerCase().includes(lowerQuery) ||
          event.description.toLowerCase().includes(lowerQuery) ||
          event.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
      )

      searchResults.push(
        ...matchingEvents.map((event) => ({
          id: event.id,
          title: event.name,
          subtitle: `${new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} • ${event.venueName}`,
          type: "event" as const,
          href: `/event/${event.id}`,
        })),
      )
    }

    // Search venues
    if (type === "all" || type === "venues") {
      const matchingVenues = mockVenues.filter(
        (venue) =>
          venue.name.toLowerCase().includes(lowerQuery) ||
          venue.description.toLowerCase().includes(lowerQuery) ||
          venue.category.toLowerCase().includes(lowerQuery) ||
          venue.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
      )

      searchResults.push(
        ...matchingVenues.map((venue) => ({
          id: venue.id,
          title: venue.name,
          subtitle: `${venue.category} • ${venue.city}`,
          type: "venue" as const,
          href: `/venue/${venue.id}`,
        })),
      )
    }

    setResults(searchResults)
    setSelectedIndex(0)
    setIsSearching(false)
  }, [])

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    if (query.length >= 2) {
      debounceTimerRef.current = setTimeout(() => {
        performSearch(query, activeTab)
      }, 300)
    } else {
      setResults([])
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [query, activeTab, performSearch])

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onOpenChange(false)
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === "Enter" && results.length > 0) {
      e.preventDefault()
      handleResultClick(results[selectedIndex])
    }
  }

  const handleResultClick = (result: SearchResult) => {
    console.log("[Analytics] search_result_click", { id: result.id, type: result.type, query })
    onOpenChange(false)
    router.push(result.href)
  }

  const handleClear = () => {
    setQuery("")
    setResults([])
    inputRef.current?.focus()
  }

  useEffect(() => {
    if (resultsRef.current) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest", behavior: "smooth" })
      }
    }
  }, [selectedIndex])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95"
      role="dialog"
      aria-modal="true"
      aria-label="Quick Search"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onOpenChange(false)
        }
      }}
    >
      <div className="container mx-auto flex h-full max-w-2xl flex-col px-4 py-6 md:py-12">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-heading font-bold">Quick Search</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-10 w-10"
            aria-label="Close search"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Search Input */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search venues or events..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-12 rounded-full pl-11 pr-12 text-base"
            aria-label="Search input"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="absolute right-1 top-1/2 h-10 w-10 -translate-y-1/2"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as typeof activeTab)}
          className="flex-1 flex flex-col"
        >
          <TabsList className="mb-4 grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="venues">Venues</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="flex-1 overflow-auto" ref={resultsRef}>
            {query.length < 2 ? (
              <div className="flex h-full items-center justify-center text-center">
                <div className="space-y-2">
                  <Search className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Type at least 2 characters to search</p>
                </div>
              </div>
            ) : isSearching ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : results.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center">
                <div className="space-y-2">
                  <Search className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No results found for "{query}"</p>
                  <p className="text-xs text-muted-foreground">Try a different search term</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className={`flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-colors ${
                      index === selectedIndex ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-accent"
                    }`}
                    aria-label={`${result.title} - ${result.subtitle}`}
                  >
                    {/* Icon */}
                    <div className="relative h-10 w-10 shrink-0">
                      <Image src="/icons/puzzle-pin.png" alt="" fill className="object-contain" />
                      <div className="absolute -bottom-1 -right-1 rounded-full bg-background p-1">
                        {result.type === "event" ? (
                          <Calendar className="h-3 w-3 text-primary" />
                        ) : (
                          <MapPin className="h-3 w-3 text-primary" />
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{result.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">{result.subtitle}</p>
                    </div>

                    {/* Chevron */}
                    <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
