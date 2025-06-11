"use client"

import { X, Sparkles, ImageIcon } from "lucide-react"

interface ImageUploadAreaProps {
  previewUrls: string[]
  onRemoveImage: (index: number) => void
  isLoading?: boolean
}

export default function ImageUploadArea({ previewUrls, onRemoveImage, isLoading = false }: ImageUploadAreaProps) {
  if (previewUrls.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-4 px-6 pt-6 pointer-events-auto">
      {previewUrls.map((url, index) => (
        <div key={index} className="relative group animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
          <div className="h-20 w-20 rounded-xl overflow-hidden border-2 border-blue-400/30 hover:border-blue-400/60 transition-all duration-300 hover-lift glow-blue-subtle relative">
            <img src={url || "/placeholder.svg"} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" />

            {/* Shimmer overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 loading-shimmer"></div>

            {/* Processing indicator when loading */}
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-blue-400 animate-spin" />
              </div>
            )}

            {/* Image indicator */}
            <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <ImageIcon className="h-3 w-3 text-blue-300" />
            </div>
          </div>

          {!isLoading && (
            <button
              type="button"
              onClick={() => onRemoveImage(index)}
              className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-r from-red-500 to-red-400 hover:from-red-400 hover:to-red-300 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group-hover:opacity-100 opacity-80 glow-blue-subtle focus-blue"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
