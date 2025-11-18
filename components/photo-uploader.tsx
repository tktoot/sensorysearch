"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, Camera, AlertCircle, WifiOff } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { createBrowserClient } from "@supabase/ssr"
import { Progress } from "@/components/ui/progress"

interface PhotoUploaderProps {
  images: string[]
  onChange: (images: string[]) => void
  entityType?: "venue" | "event" | "park"
  recordId?: string
  maxFiles?: number
  maxSizeMB?: number
  disabled?: boolean
}

interface UploadingFile {
  id: string
  file: File
  preview: string
  progress: number
  error?: string
  url?: string
}

export function PhotoUploader({
  images,
  onChange,
  entityType = "venue",
  recordId,
  maxFiles = 6,
  maxSizeMB = 5,
  disabled = false,
}: PhotoUploaderProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [isOnline, setIsOnline] = useState(true)
  const [bucketWarning, setBucketWarning] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || extractSupabaseUrl(process.env.POSTGRES_URL)
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("[v0] SUPABASE_CONFIG_ERROR - Missing Supabase credentials")
  }

  const supabase = createBrowserClient(
    supabaseUrl || "",
    supabaseKey || "",
  )

  const handleButtonClick = () => {
    if (disabled) return
    if (!isOnline) {
      toast({
        title: "You're offline",
        description: "Please connect to the internet to upload photos.",
        variant: "destructive",
      })
      return
    }
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    console.log("[v0] Files selected:", files.length)

    const totalFiles = images.length + uploadingFiles.length + files.length
    if (totalFiles > maxFiles) {
      toast({
        title: "Too many photos",
        description: `Maximum ${maxFiles} photos allowed. You can upload ${maxFiles - images.length - uploadingFiles.length} more.`,
        variant: "destructive",
      })
      return
    }

    const newUploadingFiles: UploadingFile[] = []

    for (const file of files) {
      const fileId = `${Date.now()}-${Math.random().toString(36).substring(7)}`

      const validTypes = ["image/jpeg", "image/png", "image/heic", "image/heif"]
      if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith(".heic")) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported image format. Use JPEG, PNG, or HEIC.`,
          variant: "destructive",
        })
        continue
      }

      let processedFile = file
      if (file.size > maxSizeMB * 1024 * 1024) {
        console.log("[v0] File too large, compressing:", file.name, file.size)
        try {
          processedFile = await compressImage(file, 2000, 0.8)
          console.log("[v0] Compressed size:", processedFile.size)

          if (processedFile.size > maxSizeMB * 1024 * 1024) {
            toast({
              title: "Photo too large",
              description: `${file.name} is too large (max ${maxSizeMB} MB). Please choose a smaller photo.`,
              variant: "destructive",
            })
            continue
          }
        } catch (error) {
          console.error("[v0] Compression error:", error)
          toast({
            title: "Compression failed",
            description: `Could not compress ${file.name}. Please try a different photo.`,
            variant: "destructive",
          })
          continue
        }
      }

      const preview = URL.createObjectURL(processedFile)

      newUploadingFiles.push({
        id: fileId,
        file: processedFile,
        preview,
        progress: 0,
      })
    }

    setUploadingFiles((prev) => [...prev, ...newUploadingFiles])

    for (const uploadingFile of newUploadingFiles) {
      uploadFile(uploadingFile)
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const uploadFile = async (uploadingFile: UploadingFile) => {
    try {
      console.log("[v0] Starting upload:", uploadingFile.file.name)

      const timestamp = Date.now()
      const slugifiedName = uploadingFile.file.name
        .toLowerCase()
        .replace(/[^a-z0-9.]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")

      const fileExt = slugifiedName.split(".").pop() || "jpg"
      const fileName = `${entityType}/${recordId || "temp"}/${timestamp}-${slugifiedName.replace(`.${fileExt}`, "")}.${fileExt}`

      console.log("[v0] Upload path:", fileName)

      const progressInterval = setInterval(() => {
        setUploadingFiles((prev) =>
          prev.map((f) => (f.id === uploadingFile.id && f.progress < 90 ? { ...f, progress: f.progress + 10 } : f)),
        )
      }, 200)

      const { data, error } = await supabase.storage.from("public-uploads").upload(fileName, uploadingFile.file, {
        cacheControl: "3600",
        upsert: false,
      })

      clearInterval(progressInterval)

      if (error) {
        console.error("[v0] Supabase upload error:", error)

        if (error.message.includes("not found") || error.message.includes("does not exist")) {
          setBucketWarning(true)
          toast({
            title: "Uploads disabled",
            description: "Ask admin to create the 'public-uploads' bucket.",
            variant: "destructive",
          })
        }

        setUploadingFiles((prev) =>
          prev.map((f) =>
            f.id === uploadingFile.id ? { ...f, progress: 100, error: error.message || "Upload failed" } : f,
          ),
        )
        return
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("public-uploads").getPublicUrl(data.path)

      console.log("[v0] Upload successful:", publicUrl)

      setUploadingFiles((prev) =>
        prev.map((f) => (f.id === uploadingFile.id ? { ...f, progress: 100, url: publicUrl } : f)),
      )

      onChange([...images, publicUrl])

      setTimeout(() => {
        setUploadingFiles((prev) => prev.filter((f) => f.id !== uploadingFile.id))
      }, 1000)
    } catch (error) {
      console.error("[v0] Upload error:", error)
      setUploadingFiles((prev) =>
        prev.map((f) =>
          f.id === uploadingFile.id ? { ...f, progress: 100, error: "Upload failed. Please try again." } : f,
        ),
      )
    }
  }

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages)
  }

  const handleRemoveUploading = (fileId: string) => {
    setUploadingFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const handleRetry = (uploadingFile: UploadingFile) => {
    setUploadingFiles((prev) =>
      prev.map((f) => (f.id === uploadingFile.id ? { ...f, progress: 0, error: undefined } : f)),
    )
    uploadFile(uploadingFile)
  }

  const isUploading = uploadingFiles.some((f) => f.progress < 100 && !f.error)
  const canAddMore = images.length + uploadingFiles.length < maxFiles

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">
            Photos {images.length > 0 && `(${images.length + uploadingFiles.length}/${maxFiles})`}
          </label>
          {!isOnline && (
            <div className="flex items-center gap-1 text-xs text-destructive">
              <WifiOff className="h-3 w-3" />
              <span>Offline</span>
            </div>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        id="photoInput"
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Upload photos"
      />

      {bucketWarning && (
        <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-900">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p>Uploads are disabled. Ask admin to create the 'public-uploads' bucket.</p>
        </div>
      )}

      {!isOnline && (
        <div className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-900">
          <WifiOff className="h-4 w-4 shrink-0" />
          <p>You're offline. We'll upload when you're back online.</p>
        </div>
      )}

      {canAddMore && (
        <Button
          type="button"
          onClick={handleButtonClick}
          disabled={disabled || !isOnline}
          className="w-full gap-2"
          size="lg"
        >
          <Camera className="h-5 w-5" />
          Add photos
        </Button>
      )}

      {canAddMore && (
        <p className="text-xs text-muted-foreground text-center">
          iPhone tip: you can take a photo or pick from your library
        </p>
      )}

      {uploadingFiles.length > 0 && (
        <div className="space-y-3">
          {uploadingFiles.map((file) => (
            <Card key={file.id} className="p-3">
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <img
                    src={file.preview || "/placeholder.svg"}
                    alt="Uploading"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.file.name}</p>
                  {file.error ? (
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-destructive">{file.error}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRetry(file)}
                        className="h-6 px-2 text-xs"
                      >
                        Retry
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <Progress value={file.progress} className="h-1" />
                      <p className="text-xs text-muted-foreground mt-1">{file.progress}%</p>
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveUploading(file.id)}
                  className="h-8 w-8 shrink-0"
                  aria-label="Remove"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((url, index) => (
            <Card key={url} className="group relative overflow-hidden">
              <div className="aspect-video">
                <img
                  src={url || "/placeholder.svg"}
                  alt={`Photo ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
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

      {images.length > 0 && canAddMore && (
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={disabled || !isOnline}
          className="text-sm text-[#5BC0BE] hover:underline"
        >
          Change photos
        </button>
      )}

      {isUploading && (
        <p className="text-sm text-muted-foreground">Uploading photos... Please don't close this page.</p>
      )}

      <p className="text-xs text-muted-foreground">
        Upload up to {maxFiles} photos. Max {maxSizeMB}MB each. HEIC files will be converted automatically.
      </p>
    </div>
  )
}

async function compressImage(file: File, maxWidth: number, quality: number): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        let { width, height } = img

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

function extractSupabaseUrl(postgresUrl?: string): string | undefined {
  if (!postgresUrl) return undefined
  
  try {
    const match = postgresUrl.match(/\/\/([^:]+)/)
    if (match && match[1]) {
      const host = match[1]
      if (host.includes('.supabase.')) {
        const projectRef = host.split('.')[0]
        return `https://${projectRef}.supabase.co`
      }
    }
  } catch (error) {
    console.error("[v0] Failed to extract Supabase URL", error)
  }
  
  return undefined
}
