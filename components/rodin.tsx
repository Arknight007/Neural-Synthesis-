"use client"

import { useState, useEffect } from "react"
import {
  ExternalLink,
  Download,
  ArrowLeft,
  BadgeEuroIcon,
  Globe,
  Zap,
  ChevronsDownIcon,
  History,
  FileText,
  Settings2,
} from "lucide-react"
import type { FormValues } from "@/lib/form-schema"
import { submitRodinJob, checkJobStatus, downloadModel } from "@/lib/api-service"
import ModelViewer from "./model-viewer"
import Form from "./form"
import StatusIndicator from "./status-indicator"
import OptionsDialog from "./options-dialog"
import ThreeBackground from "./three-background"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"

export default function Rodin() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [modelUrl, setModelUrl] = useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [jobStatuses, setJobStatuses] = useState<Array<{ uuid: string; status: string }>>([])
  const [showOptions, setShowOptions] = useState(false)
  const [showPromptContainer, setShowPromptContainer] = useState(true)
  const [recentModels, setRecentModels] = useState<string[]>([])
  const isMobile = useMediaQuery("(max-width: 768px)")
  const isTablet = useMediaQuery("(max-width: 1200px)")
  const [options, setOptions] = useState({
    condition_mode: "concat" as const,
    quality: "medium" as const,
    geometry_file_format: "glb" as const,
    use_hyper: false,
    tier: "Regular" as const,
    TAPose: false,
    material: "PBR" as const,
  })

  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = "hidden"
      document.documentElement.style.overflow = "hidden"

      return () => {
        document.body.style.overflow = ""
        document.documentElement.style.overflow = ""
      }
    }
  }, [isMobile])

  const handleOptionsChange = (newOptions: any) => {
    setOptions(newOptions)
  }

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "recent":
        console.log("Opening recent models...")
        // Add recent models functionality
        break
      case "templates":
        console.log("Opening templates...")
        // Add templates functionality
        break
      case "export":
        console.log("Opening export options...")
        setShowOptions(true)
        break
      default:
        break
    }
  }

  async function handleStatusCheck(subscriptionKey: string, taskUuid: string) {
    try {
      setIsPolling(true)

      const data = await checkJobStatus(subscriptionKey)
      console.log("Status response:", data)

      if (!data.jobs || !Array.isArray(data.jobs) || data.jobs.length === 0) {
        throw new Error("No jobs found in status response")
      }

      setJobStatuses(data.jobs)

      const allJobsDone = data.jobs.every((job: any) => job.status === "Done")
      const anyJobFailed = data.jobs.some((job: any) => job.status === "Failed")

      if (allJobsDone) {
        setIsPolling(false)

        try {
          const downloadData = await downloadModel(taskUuid)
          console.log("Download response:", downloadData)

          if (downloadData.error && downloadData.error !== "OK") {
            throw new Error(`Download error: ${downloadData.error}`)
          }

          if (downloadData.list && downloadData.list.length > 0) {
            const glbFile = downloadData.list.find((file: { name: string }) => file.name.toLowerCase().endsWith(".glb"))

            if (glbFile) {
              const proxyUrl = `/api/proxy-download?url=${encodeURIComponent(glbFile.url)}`
              setModelUrl(proxyUrl)
              setDownloadUrl(glbFile.url)
              setIsLoading(false)
              setShowPromptContainer(false)

              // Add to recent models
              setRecentModels((prev) => [proxyUrl, ...prev.slice(0, 4)])
            } else {
              setError("No GLB file found in the results")
              setIsLoading(false)
            }
          } else {
            setError("No files available for download")
            setIsLoading(false)
          }
        } catch (downloadErr) {
          setError(`Failed to download model: ${downloadErr instanceof Error ? downloadErr.message : "Unknown error"}`)
          setIsLoading(false)
        }
      } else if (anyJobFailed) {
        setIsPolling(false)
        setError("Generation task failed")
        setIsLoading(false)
      } else {
        setTimeout(() => handleStatusCheck(subscriptionKey, taskUuid), 3000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check status")
      setIsPolling(false)
      setIsLoading(false)
    }
  }

  async function handleSubmit(values: FormValues) {
    setIsLoading(true)
    setError(null)
    setResult(null)
    setModelUrl(null)
    setDownloadUrl(null)
    setJobStatuses([])

    try {
      const formData = new FormData()

      if (values.images && values.images.length > 0) {
        values.images.forEach((image) => {
          formData.append("images", image)
        })
      }

      if (values.prompt) {
        formData.append("prompt", values.prompt)
      }

      formData.append("condition_mode", options.condition_mode)
      formData.append("geometry_file_format", options.geometry_file_format)
      formData.append("material", options.material)
      formData.append("quality", options.quality)
      formData.append("use_hyper", options.use_hyper.toString())
      formData.append("tier", options.tier)
      formData.append("TAPose", options.TAPose.toString())
      formData.append("mesh_mode", "Quad")
      formData.append("mesh_simplify", "true")
      formData.append("mesh_smooth", "true")

      const data = await submitRodinJob(formData)
      console.log("Generation response:", data)

      setResult(data)

      if (data.jobs && data.jobs.subscription_key && data.uuid) {
        handleStatusCheck(data.jobs.subscription_key, data.uuid)
      } else {
        setError("Missing required data for status checking")
        setIsLoading(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, "_blank")
    }
  }

  const handleBack = () => {
    setShowPromptContainer(true)
  }

  const ExternalLinks = () => (
    <div className="flex items-center space-x-6">
      <a
        href="https://hyper3d.ai"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center text-blue-400 hover:text-blue-300 transition-all duration-300 hover-lift"
      >
        <Globe className="text-sm font-medium text-blue-200" />
        <span className="text-sm font-medium text-blue-200 text-right">Website</span>
      </a>
      <a
        href="https://developer.hyper3d.ai"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center text-blue-400 hover:text-blue-300 transition-all duration-300 hover-lift"
      >
        <ExternalLink className="h-4 w-4 mr-2 icon-hover text-blue-100" />
        <span className="text-sm font-medium text-blue-200">API Docs</span>
      </a>
    </div>
  )

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden">
      {/* Animated background */}
      <div className="animated-background"></div>

      {/* Three.js background */}
      <ThreeBackground />

      {/* Full-screen canvas */}
      <div className="absolute inset-0 z-0">
        <ModelViewer modelUrl={isLoading ? null : modelUrl} />
      </div>

      {/* Enhanced grid-based layout with animated starry grid */}
      <div className="app-grid relative">
        {/* Animated starry grid background */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="starry-grid-container">
            <div className="starry-grid"></div>
            <div className="starry-grid starry-grid-delayed"></div>
          </div>
        </div>
        {/* Header with enhanced proportions */}
        <header className="animate-fade-in pointer-events-auto" style={{ gridArea: "header" }}>
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center space-x-6">
              <div className="p-4 rounded-2xl glass-strong glow-blue-soft hover-glow animate-float">
                <ChevronsDownIcon className="h-8 w-8 text-blue-200" />
              </div>
              <div>
                <h1 className="responsive-heading text-blue-50 tracking-tight font-mono font-black">
                  Neural Synthesis
                </h1>
                <div className="flex items-center space-x-3 mt-2">
                  <Zap className="h-4 w-4 text-blue-400 animate-pulse-blue" />
                  <p className="responsive-text font-medium font-mono text-blue-200">Advanced 3D Model Generation</p>
                </div>
              </div>
            </div>

            {!isMobile && (
              <div className="glass-strong rounded-2xl px-8 py-4 hover-glow text-left">
                <ExternalLinks />
              </div>
            )}
          </div>
        </header>

        {/* Enhanced sidebar - Hidden on tablet/mobile */}
        {!isTablet && (
          <aside className="animate-slide-up pointer-events-auto" style={{ gridArea: "sidebar" }}>
            <div className="glass-minimal rounded-2xl p-6 h-full">
              <div className="flex flex-col space-y-6">
                <div className="flex items-center space-x-3">
                  <BadgeEuroIcon className="h-5 w-5 animate-rotate-slow text-cyan-100" />
                  <span className="responsive-text font-semibold text-cyan-50">Neural Status</span>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-100">Processing Power</span>
                    <span className="font-medium text-blue-100">98%</span>
                  </div>
                  <div className="w-full bg-blue-900/30 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full progress-blue glow-blue-subtle bg-slate-800"
                      style={{ width: "98%" }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-100">Memory Usage</span>
                    <span className="font-medium text-blue-100">76%</span>
                  </div>
                  <div className="w-full rounded-full h-2 overflow-hidden bg-slate-800">
                    <div
                      className="bg-blue-400 h-2 rounded-full progress-blue glow-blue-subtle"
                      style={{ width: "76%" }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-100">Network Load</span>
                    <span className="font-medium text-blue-100">42%</span>
                  </div>
                  <div className="w-full rounded-full h-2 overflow-hidden bg-slate-800">
                    <div
                      className="h-2 rounded-full progress-blue glow-blue-subtle bg-slate-500"
                      style={{ width: "42%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Main content area */}
        <main className="relative" style={{ gridArea: "main" }}>
          {/* Dynamic starry background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div className="starry-background">
              {Array.from({ length: 80 }).map((_, i) => (
                <div
                  key={i}
                  className="star"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 4}s`,
                    animationDuration: `${3 + Math.random() * 3}s`,
                  }}
                />
              ))}
            </div>

            {/* Enhanced tinted grid overlay with uniform coverage */}
            <div className="grid-overlay">
              <svg className="grid-pattern" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="smallGrid" width="5" height="5" patternUnits="userSpaceOnUse">
                    <path d="M 5 0 L 0 0 0 5" fill="none" stroke="rgba(59, 130, 246, 0.06)" strokeWidth="0.3" />
                  </pattern>
                  <pattern id="mediumGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(59, 130, 246, 0.04)" strokeWidth="0.5" />
                  </pattern>
                  <pattern id="largeGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(59, 130, 246, 0.03)" strokeWidth="0.8" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#smallGrid)" />
                <rect width="100%" height="100%" fill="url(#mediumGrid)" />
                <rect width="100%" height="100%" fill="url(#largeGrid)" />
              </svg>

              {/* Grid intersections for enhanced futuristic effect */}
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="grid-intersection"
                  style={{
                    left: `${(i % 4) * 25 + 12.5}%`,
                    top: `${Math.floor(i / 4) * 50 + 25}%`,
                    animationDelay: `${i * 0.5}s`,
                  }}
                />
              ))}

              {/* Animated grid lines with enhanced coverage */}
              <div className="animated-grid-lines">
                <div className="grid-line horizontal" style={{ top: "25%", animationDelay: "0s" }} />
                <div className="grid-line horizontal" style={{ top: "50%", animationDelay: "2s" }} />
                <div className="grid-line horizontal" style={{ top: "75%", animationDelay: "4s" }} />
                <div className="grid-line vertical" style={{ left: "25%", animationDelay: "1s" }} />
                <div className="grid-line vertical" style={{ left: "50%", animationDelay: "3s" }} />
                <div className="grid-line vertical" style={{ left: "75%", animationDelay: "5s" }} />
              </div>
            </div>
          </div>

          {/* Loading indicator */}
          <StatusIndicator isLoading={isLoading} jobStatuses={jobStatuses} />

          {/* Enhanced error message */}
          {error && (
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 pointer-events-auto animate-scale-in z-20">
              <div className="glass-strong rounded-2xl px-8 py-6 border-red-500/20 max-w-md glow-blue-soft">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse-blue"></div>
                  <div>
                    <p className="text-red-400 font-semibold responsive-text">Generation Error</p>
                    <p className="text-blue-200 text-sm mt-2">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced model controls */}
          {!isLoading && modelUrl && !showPromptContainer && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-6 pointer-events-auto animate-slide-up z-20">
              <Button
                onClick={handleBack}
                className="glass-strong hover:glass-strong hover:glow-blue-medium rounded-2xl px-8 py-4 text-blue-50 border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 hover-lift btn-interactive"
              >
                <ArrowLeft className="h-5 w-5 mr-3" />
                <span className="font-medium responsive-text">New Generation</span>
              </Button>

              <Button
                onClick={handleDownload}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-2xl px-8 py-4 font-medium transition-all duration-300 hover-lift glow-blue-medium btn-interactive"
              >
                <Download className="h-5 w-5 mr-3" />
                <span className="responsive-text">Download Model</span>
              </Button>
            </div>
          )}
        </main>

        {/* Enhanced actions sidebar - Hidden on tablet/mobile */}
        {!isTablet && (
          <aside className="animate-slide-up pointer-events-auto" style={{ gridArea: "actions" }}>
            <div className="glass-minimal rounded-2xl p-6 h-full">
              <div className="flex flex-col space-y-6">
                <div className="flex items-center space-x-3">
                  <Zap className="h-5 w-5 animate-pulse-blue text-sky-200" />
                  <span className="responsive-text font-semibold text-blue-100">Quick Actions</span>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => handleQuickAction("recent")}
                    className="w-full text-left p-4 rounded-xl quick-action text-blue-300 responsive-text transition-all duration-300 focus-blue"
                  >
                    <div className="flex items-center space-x-3">
                      <History className="h-4 w-4 icon-hover text-sky-200" />
                      <span className="text-blue-100">Recent Models</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleQuickAction("templates")}
                    className="w-full text-left p-4 rounded-xl quick-action text-blue-300 responsive-text transition-all duration-300 focus-blue"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="h-4 w-4 icon-hover text-sky-200" />
                      <span className="text-blue-100">Templates</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleQuickAction("export")}
                    className="w-full text-left p-4 rounded-xl quick-action text-blue-300 responsive-text transition-all duration-300 focus-blue"
                  >
                    <div className="flex items-center space-x-3">
                      <Settings2 className="h-4 w-4 icon-hover text-sky-200" />
                      <span className="font-sans text-blue-100">Export Options</span>
                    </div>
                  </button>
                </div>

                {recentModels.length > 0 && (
                  <div className="mt-6">
                    <p className="text-blue-400 text-sm font-medium mb-3">Recent Generations</p>
                    <div className="space-y-2">
                      {recentModels.slice(0, 3).map((model, index) => (
                        <div
                          key={index}
                          className="w-full h-12 bg-blue-500/10 rounded-lg animate-scale-in"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>
        )}

        {/* Enhanced footer/search area */}
        {showPromptContainer && (
          <footer className="pointer-events-auto animate-slide-up" style={{ gridArea: "footer" }}>
            <div className="search-container">
              <Form isLoading={isLoading} onSubmit={handleSubmit} onOpenOptions={() => setShowOptions(true)} />

              {isMobile && (
                <div className="mt-6 flex justify-center">
                  <div className="glass-strong rounded-2xl px-8 py-4 hover-glow">
                    <ExternalLinks />
                  </div>
                </div>
              )}
            </div>
          </footer>
        )}
      </div>

      {/* Options Dialog */}
      <OptionsDialog
        open={showOptions}
        onOpenChange={setShowOptions}
        options={options}
        onOptionsChange={handleOptionsChange}
      />
    </div>
  )
}
