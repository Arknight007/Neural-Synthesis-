"use client"

import ProgressBar from "./progress-bar"
import { Brain, Activity, Cpu, Zap } from "lucide-react"

interface StatusIndicatorProps {
  isLoading: boolean
  jobStatuses: Array<{ uuid: string; status: string }>
}

export default function StatusIndicator({ isLoading, jobStatuses }: StatusIndicatorProps) {
  if (!isLoading) {
    return null
  }

  const actualTasks = jobStatuses.length
  const totalTasks = actualTasks > 0 ? actualTasks + 1 : 0

  const completedJobTasks = jobStatuses.filter((job) => job.status === "Done").length
  const initialRequestComplete = actualTasks > 0 ? 1 : 0
  const completedTasks = completedJobTasks + initialRequestComplete

  const showProgress = actualTasks > 0
  const isIndeterminate = actualTasks === 0

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-scale-in z-10">
      <div className="glass-strong rounded-3xl p-12 border-blue-400/30 glow-blue-medium relative overflow-hidden">
        {/* Background animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-blue-500/10 to-blue-400/10 animate-pulse-blue"></div>

        <div className="relative flex flex-col items-center space-y-8">
          {/* Enhanced icon with multiple layers */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 flex items-center justify-center glow-blue-medium">
              <Brain className="h-12 w-12 text-blue-50 floating" />
            </div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 animate-ping opacity-20"></div>
            <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-blue-400 via-blue-300 to-blue-200 animate-pulse-blue opacity-30"></div>

            {/* Floating particles around icon */}
            <div className="absolute -top-3 -right-3 w-2 h-2 bg-blue-400 rounded-full floating"></div>
            <div
              className="absolute -bottom-3 -left-3 w-1.5 h-1.5 bg-blue-300 rounded-full floating"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="absolute top-1/2 -right-5 w-1 h-1 bg-blue-200 rounded-full floating"
              style={{ animationDelay: "2s" }}
            ></div>
          </div>

          {/* Enhanced status text */}
          <div className="text-center space-y-4">
            <h3 className="text-blue-50 font-bold responsive-heading">
              {isIndeterminate ? "Initializing Neural Networks" : "Processing 3D Model"}
            </h3>
            <p className="text-blue-300 responsive-text font-medium">
              {isIndeterminate
                ? "Preparing AI systems for generation..."
                : `${completedTasks}/${totalTasks} neural processes completed`}
            </p>
          </div>

          {/* Enhanced progress bar */}
          <div className="w-full max-w-md">
            <ProgressBar totalTasks={totalTasks} completedTasks={completedTasks} isIndeterminate={isIndeterminate} />
          </div>

          {/* Enhanced processing indicators */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2 text-blue-400">
              <Cpu className="h-5 w-5 animate-pulse-blue" />
              <span className="text-sm font-semibold">Neural Processing</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-300">
              <Activity className="h-5 w-5 animate-pulse-blue" style={{ animationDelay: "0.5s" }} />
              <span className="text-sm font-semibold">3D Generation</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-200">
              <Zap className="h-5 w-5 animate-pulse-blue" style={{ animationDelay: "1s" }} />
              <span className="text-sm font-semibold">Optimization</span>
            </div>
          </div>

          {/* Status dots */}
          <div className="flex space-x-4">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse-blue"></div>
            <div
              className="w-3 h-3 bg-blue-400 rounded-full animate-pulse-blue"
              style={{ animationDelay: "0.3s" }}
            ></div>
            <div
              className="w-3 h-3 bg-blue-300 rounded-full animate-pulse-blue"
              style={{ animationDelay: "0.6s" }}
            ></div>
            <div
              className="w-3 h-3 bg-blue-200 rounded-full animate-pulse-blue"
              style={{ animationDelay: "0.9s" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}
