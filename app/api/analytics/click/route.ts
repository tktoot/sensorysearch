import { createAdminClient } from "@/lib/supabase-admin"
import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { itemType, itemId } = await request.json()

    if (!itemType || !itemId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const adminClient = createAdminClient()

    await adminClient.from("analytics_clicks").insert({
      item_type: itemType,
      item_id: itemId,
      user_id: user?.id || null,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Analytics error:", error)
    return NextResponse.json({ error: "Failed to track click" }, { status: 500 })
  }
}
