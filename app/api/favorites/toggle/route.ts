import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { listingId, listingType = "event" } = await request.json()

    if (!listingId) {
      return NextResponse.json({ error: "listingId is required" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Check if already favorited
    const { data: existing } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("item_id", listingId)
      .single()

    if (existing) {
      // Remove favorite
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("item_id", listingId)

      if (error) {
        console.error("[v0] Failed to remove favorite:", error)
        return NextResponse.json({ error: "Failed to remove favorite" }, { status: 500 })
      }

      return NextResponse.json({
        ok: true,
        isFavorite: false,
      })
    } else {
      // Add favorite
      const { error } = await supabase
        .from("favorites")
        .insert({
          user_id: user.id,
          item_id: listingId,
          item_type: listingType,
        })

      if (error) {
        console.error("[v0] Failed to add favorite:", error)
        return NextResponse.json({ error: "Failed to add favorite" }, { status: 500 })
      }

      return NextResponse.json({
        ok: true,
        isFavorite: true,
      })
    }
  } catch (error) {
    console.error("[v0] Failed to toggle favorite:", error)
    return NextResponse.json({ error: "Failed to toggle favorite" }, { status: 500 })
  }
}
