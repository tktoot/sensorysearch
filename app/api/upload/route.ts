import { createAdminClient } from "@/lib/supabase-admin"
import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { UPLOAD_MAX_MB, UPLOAD_MAX_IMAGES } from "@/lib/config"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("file") as File[]

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    if (files.length > UPLOAD_MAX_IMAGES) {
      return NextResponse.json({ error: `Maximum ${UPLOAD_MAX_IMAGES} images allowed` }, { status: 400 })
    }

    const maxSizeBytes = UPLOAD_MAX_MB * 1024 * 1024
    for (const file of files) {
      if (file.size > maxSizeBytes) {
        return NextResponse.json({ error: `File ${file.name} exceeds ${UPLOAD_MAX_MB}MB limit` }, { status: 400 })
      }
    }

    const supabase = createAdminClient()
    const uploadedUrls: string[] = []

    for (const file of files) {
      const fileExt = file.name.split(".").pop()
      const fileName = `${uuidv4()}.${fileExt}`
      const filePath = `listings/${fileName}`

      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const { data, error } = await supabase.storage.from("public-uploads").upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

      if (error) {
        console.error("[v0] Upload error:", error)
        throw error
      }

      const { data: publicUrlData } = supabase.storage.from("public-uploads").getPublicUrl(data.path)

      uploadedUrls.push(publicUrlData.publicUrl)
      console.log("[v0] Image uploaded to Supabase Storage:", publicUrlData.publicUrl)
    }

    return NextResponse.json({ urls: uploadedUrls })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
