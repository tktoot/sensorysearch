import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { UPLOAD_MAX_MB } from "@/lib/config"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Check file size
    if (file.size > UPLOAD_MAX_MB * 1024 * 1024) {
      return NextResponse.json({ error: `File exceeds ${UPLOAD_MAX_MB}MB limit` }, { status: 400 })
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage.from("listings").upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("[v0] Supabase Storage error:", error)
      return NextResponse.json({ error: "Upload failed" }, { status: 500 })
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("listings").getPublicUrl(data.path)

    console.log("[v0] IMAGE_UPLOADED", { path: data.path, url: publicUrl })

    return NextResponse.json({ url: publicUrl })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
