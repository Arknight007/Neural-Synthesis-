"use client"

import type React from "react"

import { useState, useRef } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import type * as z from "zod"
import { Form as UIForm } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { ImageIcon, Settings, Send, Sparkles, Upload, Mic, Camera } from "lucide-react"
import AutoResizeTextarea from "./auto-resize-textarea"
import ImageUploadArea from "./image-upload-area"
import { formSchema } from "@/lib/form-schema"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

interface FormProps {
  isLoading: boolean
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>
  onOpenOptions: () => void
}

export default function Form({ isLoading, onSubmit, onOpenOptions }: FormProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFocused, setIsFocused] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropAreaRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const dragCounter = useRef(0)
  const isMobile = useMediaQuery("(max-width: 768px)")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      images: [],
      condition_mode: "concat",
      quality: "medium",
      geometry_file_format: "glb",
      use_hyper: false,
      tier: "Regular",
      TAPose: false,
      material: "PBR",
    },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    addImages(files)
  }

  const addImages = (files: File[]) => {
    if (files.length === 0) return

    const currentImages = form.getValues("images") || []
    const totalImages = currentImages.length + files.length

    if (totalImages > 5) {
      setError("Maximum 5 images allowed")
      const allowedNewImages = 5 - currentImages.length
      files = files.slice(0, allowedNewImages)

      if (files.length === 0) return
    }

    const newPreviewUrls = files.map((file) => URL.createObjectURL(file))
    const updatedImages = [...currentImages, ...files]

    setPreviewUrls([...previewUrls, ...newPreviewUrls])
    form.setValue("images", updatedImages)
    setError(null)
  }

  const removeImage = (index: number) => {
    const currentImages = form.getValues("images") || []
    const newImages = [...currentImages]
    newImages.splice(index, 1)

    const newPreviewUrls = [...previewUrls]
    URL.revokeObjectURL(newPreviewUrls[index])
    newPreviewUrls.splice(index, 1)

    setPreviewUrls(newPreviewUrls)
    form.setValue("images", newImages)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current += 1
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current -= 1
    if (dragCounter.current === 0) {
      setIsDragging(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current = 0
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"))
      addImages(files)
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleBlur = () => {
    setIsFocused(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (!isMobile && !e.shiftKey) {
        e.preventDefault()
        formRef.current?.requestSubmit()
      }
    }
  }

  return (
    <UIForm {...form}>
      <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="relative">
        <div
          ref={dropAreaRef}
          className={cn(
            "relative glass-search search-bar-enhanced overflow-hidden transition-all duration-500",
            isDragging
              ? "border-blue-400 glow-blue-strong scale-[1.02] rotate-1"
              : isFocused
                ? "border-blue-400/60 glow-blue-medium"
                : "border-blue-500/20",
            isLoading && "animate-pulse-blue pointer-events-none opacity-90",
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* Enhanced scan line effect */}
          {isFocused && !isLoading && <div className="scan-line absolute inset-0 pointer-events-none"></div>}

          {/* Image previews */}
          <ImageUploadArea previewUrls={previewUrls} onRemoveImage={removeImage} isLoading={isLoading} />

          <div className="flex space-x-6 items-start">
            {/* Enhanced action buttons */}
            <div className="flex space-x-3">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                disabled={isLoading}
              />

              <Button
                type="button"
                variant="link"
                size="icon"
                onClick={triggerFileInput}
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-2xl h-14 w-14 transition-all duration-300 hover-lift focus-blue btn-interactive font-bold"
                disabled={isLoading}
              >
                <ImageIcon className="h-6 w-6 icon-hover border-white" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-2xl h-14 w-14 transition-all duration-300 hover-lift focus-blue btn-interactive"
                disabled={isLoading}
              >
                <Camera className="h-6 w-6 icon-hover" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onOpenOptions}
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-2xl h-14 w-14 transition-all duration-300 hover-lift focus-blue btn-interactive"
                disabled={isLoading}
              >
                <Settings className="h-6 w-6 icon-rotate" />
              </Button>
            </div>

            {/* Enhanced text input */}
            <AutoResizeTextarea
              placeholder="Describe your 3D model in detail..."
              className="flex-1 bg-transparent border-0 focus:ring-0 text-blue-50 placeholder:text-blue-300/60 py-6 px-6 resize-none responsive-subheading font-medium focus-blue"
              {...form.register("prompt")}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />

            {/* Enhanced submit button */}
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-2xl h-16 w-16 transition-all duration-300 hover-lift focus-blue btn-interactive"
                disabled={isLoading}
              >
                <Mic className="h-6 w-6 icon-hover" />
              </Button>

              <Button
                type="submit"
                className={cn(
                  "rounded-2xl h-16 w-16 p-0 flex items-center justify-center transition-all duration-500 hover-lift relative overflow-hidden focus-blue btn-interactive",
                  isLoading
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 animate-pulse-blue loading-shimmer"
                    : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 glow-blue-medium hover:scale-110",
                )}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Sparkles className="h-7 w-7 animate-spin text-blue-100" />
                ) : (
                  <Send className="h-7 w-7 text-blue-50 hover-scale" />
                )}
              </Button>
            </div>
          </div>

          {/* Enhanced drag overlay */}
          {isDragging && (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-blue-600/20 to-blue-700/20 backdrop-blur-sm flex items-center justify-center pointer-events-none z-20">
              <div className="text-center animate-scale-in">
                <div className="w-28 h-28 mx-auto mb-8 rounded-full bg-blue-400/20 flex items-center justify-center glow-blue-medium animate-float">
                  <Upload className="h-14 w-14 text-blue-400" />
                </div>
                <p className="text-blue-100 font-bold responsive-subheading mb-3">Drop your images here</p>
                <p className="text-blue-200 responsive-text mb-6">Transform them into stunning 3D models</p>
                <div className="flex items-center justify-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-blue-400 animate-float" />
                    <span className="text-blue-300 responsive-text font-medium">Up to 5 images</span>
                  </div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-blue-300 responsive-text">JPG, PNG, WebP</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced error message */}
        {error && (
          <div className="mt-6 animate-scale-in">
            <div className="glass-strong rounded-2xl px-8 py-6 border-red-500/30 glow-blue-soft">
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse-blue"></div>
                <div>
                  <p className="text-red-400 font-semibold responsive-text">Upload Error</p>
                  <p className="text-blue-200 text-sm mt-2">{error}</p>
                </div>
                <Sparkles className="h-5 w-5 text-red-400 ml-auto animate-float" />
              </div>
            </div>
          </div>
        )}
      </form>
    </UIForm>
  )
}
