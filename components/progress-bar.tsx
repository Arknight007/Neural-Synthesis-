"use client"

import { cn } from "@/lib/utils"

interface ProgressBarProps {
  totalTasks: number
  completedTasks: number
  className?: string
  isIndeterminate?: boolean
}

export default function ProgressBar({
  totalTasks,
  completedTasks,
  className,
  isIndeterminate = false,
}: ProgressBarProps) {
  const percentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <div
      className={cn(
        "w-full bg-blue-900/30 rounded-full h-4 overflow-hidden border-2 border-blue-400/30 relative",
        className,
      )}
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-blue-500/20 to-blue-400/20 animate-pulse-blue"></div>

      {isIndeterminate ? (
        <div className="h-full relative w-full">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 absolute w-[50%] progress-blue rounded-full glow-blue-medium"
            style={{ animation: "progress-indeterminate 2s ease-in-out infinite" }}
          />
        </div>
      ) : (
        <div
          className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 transition-all duration-1000 rounded-full glow-blue-medium progress-blue relative overflow-hidden"
          style={{ width: `${percentage}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent loading-shimmer"></div>
        </div>
      )}
    </div>
  )
}
