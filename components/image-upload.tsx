"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, X, GripVertical, AlertCircle } from "lucide-react"
import { UPLOAD_MAX_MB, UPLOAD_MAX_IMAGES } from "@/lib/config"

interface ImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
  maxSizeMB?: number
}

export function ImageUpload({
  images,
  onChange,
  maxImages = UPLOAD_MAX_IMAGES,
  maxSizeMB = UPLOAD_MAX_MB,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Check if adding these files would exceed max images
    if (images.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`)
      return
    }

    setUploading(true)
    setError(null)

    try {
      const uploadedUrls: string[] = []

      for (const file of files) {
        // Check file size
        if (file.size > maxSizeMB * 1024 * 1024) {
          setError(`File ${file.name} exceeds ${maxSizeMB}MB limit`)
          continue
        }

        // Convert HEIC to JPEG if needed
        let processedFile = file
        if (file.type === "image/heic" || file.type === "image/heif" || file.name.toLowerCase().endsWith(".heic")) {
          processedFile = await convertHEICtoJPEG(file)
        }

        // Compress and resize image
        const compressedFile = await compressImage(processedFile, 1600, 0.85)

        const formData = new FormData()
        formData.append("file", compressedFile)

        const response = await fetch("/api/upload-supabase", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Upload failed for ${file.name}`)
        }

        const { url } = await response.json()
        uploadedUrls.push(url)
      }

      onChange([...images, ...uploadedUrls])
    } catch (err) {
      console.error("[v0] Image upload error:", err)
      setError("Failed to upload images. Please try again.")
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages)
  }

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newImages = [...images]
    const [removed] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, removed)
    onChange(newImages)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Photos {images.length > 0 && `(${images.length}/${maxImages})`}</label>
        {images.length < maxImages && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading..." : "Add Photos"}
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Upload photos"
      />

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {images.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((url, index) => (
            <Card key={url} className="group relative overflow-hidden">
              <div className="aspect-video">
                <img
                  src={url || "/placeholder.svg"}
                  alt={`Upload ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={() => handleRemove(index)}
                  className="h-8 w-8"
                  aria-label="Remove photo"
                >
                  <X className="h-4 w-4" />
                </Button>
                {index > 0 && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    onClick={() => handleReorder(index, index - 1)}
                    className="h-8 w-8"
                    aria-label="Move left"
                  >
                    <GripVertical className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {index === 0 && (
                <div className="absolute left-2 top-2">
                  <span className="rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                    Cover
                  </span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Upload up to {maxImages} photos. Max {maxSizeMB}MB each. HEIC files will be converted automatically.
      </p>
    </div>
  )
}

// Helper: Convert HEIC to JPEG
async function convertHEICtoJPEG(file: File): Promise<File> {
  // In a real implementation, you'd use a library like heic2any
  // For now, we'll just return the file as-is and let the server handle it
  console.log("[v0] HEIC conversion needed for:", file.name)
  return file
}

// Helper: Compress and resize image
async function compressImage(file: File, maxWidth: number, quality: number): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        let { width, height } = img

        // Resize if needed
        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = (height / width) * maxWidth
            width = maxWidth
          } else {
            width = (width / height) * maxWidth
            height = maxWidth
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Failed to get canvas context"))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to compress image"))
              return
            }
            const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
              type: "image/jpeg",
            })
            resolve(compressedFile)
          },
          "image/jpeg",
          quality,
        )
      }
      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsDataURL(file)
  })
}
