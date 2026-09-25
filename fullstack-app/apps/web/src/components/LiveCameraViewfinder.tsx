import { useState, useRef, useEffect } from "react"
import { CRAFT_KNOWLEDGE_BASE } from "../utils/pricingEngine"

interface LiveCameraViewfinderProps {
  onCapture?: (imageUrl: string, craftHint?: string) => void
  onCapturePhoto?: (imageUrl: string) => void
  onClose?: () => void
  showToast?: (msg: string) => void
  isProcessing?: boolean
  processingLabel?: string
  capturedImage?: string | null
  onResetCapture?: () => void
  title?: string
  subtitle?: string
}

export default function LiveCameraViewfinder({
  onCapture,
  onCapturePhoto,
  onClose,
  showToast,
  isProcessing = false,
  processingLabel = "Scanning craft...",
  capturedImage = null,
  onResetCapture,
  title = "Point Camera at Craft",
  subtitle = "Align the handicraft inside the viewfinder",
}: LiveCameraViewfinderProps) {
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment",
  )
  const [showGrid, setShowGrid] = useState(true)
  const [flashOn, setFlashOn] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Start / Stop camera stream
  const startCamera = async (mode: "environment" | "user" = facingMode) => {
    stopCamera()
    setCameraError(null)

    // Inside the native Expo shell the page lives in an Android WebView with
    // no getUserMedia — "Open Live Camera" delegates to the phone's real
    // camera via the native bridge instead of trying a browser stream.
    const nativeShell = (window as any)?.ReactNativeWebView
    if (nativeShell) {
      try {
        window.__simplificantNativeBridge?.openNativeCamera?.()
      } catch (err) {
        console.warn("native camera request failed", err)
      }
      showToast?.("📷 Opening camera…")
      return
    }

    if (!navigator?.mediaDevices?.getUserMedia) {
      setCameraError(
        "Live camera isn't supported in this view. Use the 📷 Add Photo button in the app or upload a photo instead.",
      )
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setCameraActive(true)
    } catch (err: any) {
      console.warn("Camera init issue:", err)
      setCameraError(
        err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
          ? "Camera permission was denied. Please allow camera access in browser settings or upload a craft photo below."
          : "Could not open camera stream. You can upload an image or select a sample craft.",
      )
      setCameraActive(false)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }

  // Dispatches capture event to onCapture and/or onCapturePhoto
  const triggerCapture = (imageUrl: string, craftHint?: string) => {
    if (onCapture) onCapture(imageUrl, craftHint)
    if (onCapturePhoto) onCapturePhoto(imageUrl)
  }

  // Handle Capture from live webcam
  const handleSnapPhoto = () => {
    if (!videoRef.current) return
    const video = videoRef.current
    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const dataUrl = canvas.toDataURL("image/jpeg", 0.92)
      stopCamera()
      triggerCapture(dataUrl)
    }
  }

  // Toggle Camera flip
  const handleToggleFacingMode = () => {
    const nextMode = facingMode === "environment" ? "user" : "environment"
    setFacingMode(nextMode)
    startCamera(nextMode)
  }

  // File Upload / Drop handler
  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      stopCamera()
      triggerCapture(result, file.name)
    }
    reader.readAsDataURL(file)
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="space-y-3.5">
      {/* Viewfinder Main Stage */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragOver(false)
          const file = e.dataTransfer.files?.[0]
          if (file) handleFile(file)
        }}
        className={`relative aspect-16/10 sm:aspect-16/9 w-full rounded-2xl overflow-hidden bg-[#1E1712] border-2 transition-all flex items-center justify-center ${
          isDragOver
            ? "border-[#C9922E] ring-4 ring-[#C9922E]/20 bg-[#241C15]"
            : "border-[#E4DAC8]"
        }`}
      >
        {/* State 1: Captured Image Display */}
        {capturedImage ? (
          <div className="relative w-full h-full">
            <img
              src={capturedImage}
              alt="Captured Craft"
              className={`w-full h-full object-contain bg-[#1E1712] ${
                flashOn ? "brightness-110 contrast-105" : ""
              }`}
            />
            {onResetCapture && !isProcessing && (
              <button
                type="button"
                onClick={() => {
                  onResetCapture()
                  setCameraActive(false)
                }}
                className="absolute top-3 right-3 bg-[#241C15]/80 hover:bg-[#241C15] text-white px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-transform hover:scale-105"
              >
                <span>🔄 Retake Photo</span>
              </button>
            )}
          </div>
        ) : cameraActive ? (
          /* State 2: Active Live Camera Feed */
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              playsInline
              muted
              className={`w-full h-full object-cover ${
                flashOn ? "brightness-125 contrast-110" : ""
              }`}
            />

            {/* Rule of Thirds Grid Overlay */}
            {showGrid && (
              <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-30">
                <div className="border-r border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-b border-white" />
                <div className="border-r border-white" />
                <div className="border-r border-white" />
                <div />
              </div>
            )}

            {/* Smart Detection Reticle & Corner Brackets */}
            <div className="absolute inset-8 sm:inset-12 pointer-events-none border border-[#C9922E]/40 rounded-xl flex items-center justify-center">
              {/* Corner Accents */}
              <div className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-[#C9922E]" />
              <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-[#C9922E]" />
              <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-[#C9922E]" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-[#C9922E]" />

              {/* Target Crosshair */}
              <div className="w-10 h-10 border border-white/40 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-[#C9922E] rounded-full animate-ping" />
              </div>

              {/* Real-time telemetry tag */}
              <span className="absolute bottom-2 bg-[#241C15]/85 text-[#F7F2E9] text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full border border-[#C9922E]/30">
                LIVE CV HUD • 60 FPS • AUTOFOCUS ON
              </span>
            </div>

            {/* Live Camera On-Screen Controls */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-white text-xs">
              <span className="bg-red-600 text-white font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                LIVE
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowGrid(!showGrid)}
                  title="Toggle Grid"
                  className={`w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer ${
                    showGrid
                      ? "bg-[#C9922E] text-[#241C15]"
                      : "bg-black/40 text-white"
                  }`}
                >
                  ▦
                </button>
                <button
                  type="button"
                  onClick={() => setFlashOn(!flashOn)}
                  title="Toggle Light Enhancement"
                  className={`w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer ${
                    flashOn
                      ? "bg-amber-400 text-[#241C15]"
                      : "bg-black/40 text-white"
                  }`}
                >
                  ⚡
                </button>
                <button
                  type="button"
                  onClick={handleToggleFacingMode}
                  title="Flip Camera"
                  className="w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer"
                >
                  🔄
                </button>
              </div>
            </div>

            {/* Shutter Button */}
            <div className="absolute bottom-4 inset-x-0 flex justify-center items-center gap-4 z-10">
              <button
                type="button"
                onClick={handleSnapPhoto}
                className="group relative w-16 h-16 rounded-full border-4 border-white bg-[#C9922E] hover:bg-[#DCA33C] flex items-center justify-center shadow-2xl transition-transform active:scale-95 cursor-pointer"
              >
                <span className="w-12 h-12 rounded-full bg-white/20 group-hover:bg-white/30 flex items-center justify-center text-xl">
                  📸
                </span>
              </button>
            </div>
          </div>
        ) : (
          /* State 3: Standby / Prompt View */
          <div className="p-6 text-center text-[#F7F2E9] space-y-3 max-w-sm">
            <div className="w-14 h-14 rounded-2xl bg-[#C9922E]/20 border border-[#C9922E]/40 mx-auto flex items-center justify-center text-2xl text-[#C9922E]">
              📷
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold font-serif text-[#F7F2E9]">
                {title}
              </h4>
              <p className="text-xs text-[#E4DAC8]/80 mt-0.5">{subtitle}</p>
            </div>

            {cameraError && (
              <div className="p-2.5 rounded-xl bg-amber-950/70 border border-amber-500/40 text-amber-200 text-[11px] text-left">
                {cameraError}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => startCamera("environment")}
                className="bg-[#C9922E] hover:bg-[#DCA33C] text-[#241C15] font-bold text-xs px-4 py-2 rounded-full shadow-md transition-transform hover:scale-105 flex items-center gap-1.5 cursor-pointer"
              >
                <span>🎥 Open Live Camera</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white/15 hover:bg-white/25 text-white font-medium text-xs px-3.5 py-2 rounded-full border border-white/20 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>📁 Upload File</span>
              </button>
            </div>

            <p className="text-[10px] text-[#9C9182]">
              or drag & drop a craft photo here
            </p>
          </div>
        )}

        {/* Real-time Scanning HUD Laser Animation */}
        {isProcessing && (
          <div className="absolute inset-0 bg-[#241C15]/75 backdrop-blur-xs flex flex-col items-center justify-center text-white z-20 gap-3 p-4 text-center">
            {/* Animated Laser Scanning Line */}
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#C9922E] to-transparent shadow-[0_0_15px_#C9922E] animate-bounce" />

            <div className="relative w-14 h-14">
              <div className="w-14 h-14 border-4 border-[#C9922E] border-t-transparent rounded-full animate-spin" />
              <span className="absolute inset-0 flex items-center justify-center text-xl">
                ✨
              </span>
            </div>

            <div className="space-y-1 max-w-xs">
              <h4 className="text-sm font-bold font-serif text-[#F7F2E9]">
                {processingLabel}
              </h4>
              <p className="text-[11px] text-[#E4DAC8]/80 animate-pulse">
                Analyzing texture, mineral density, labor hours & GI cluster
                index…
              </p>
            </div>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
        />
      </div>

      {/* Quick Test Archetypes Bank */}
      <div className="bg-[#FBF8F1] p-3 rounded-2xl border border-[#E4DAC8] space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold uppercase tracking-wider text-[#9C9182]">
            ⚡ Or test with authenticated craft samples:
          </span>
          <span className="text-[#B7592F] font-semibold text-[10.5px]">
            Click any to scan instantly
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {CRAFT_KNOWLEDGE_BASE.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => {
                stopCamera()
                triggerCapture(sample.sampleImage, sample.title)
              }}
              className="group relative rounded-xl overflow-hidden border border-[#E4DAC8] hover:border-[#C9922E] bg-white p-1.5 text-left transition-all hover:shadow-sm cursor-pointer"
            >
              <div className="aspect-square w-full rounded-lg overflow-hidden bg-[#EFE8D8] mb-1.5">
                <img
                  src={sample.sampleImage}
                  alt={sample.title}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-300"
                />
              </div>
              <p className="text-[10.5px] font-bold text-[#241C15] truncate">
                {sample.id === "channapatna-toys"
                  ? "Wooden Toys"
                  : sample.id === "jaipur-pottery"
                    ? "Blue Pottery"
                    : sample.id === "banarasi-silk"
                      ? "Banarasi Silk"
                      : sample.id === "mysuru-rosewood"
                        ? "Rosewood Inlay"
                        : sample.id === "bastar-dhokra"
                          ? "Dhokra Metal"
                          : sample.id === "moradabad-brass"
                            ? "Moradabad Brass"
                            : sample.id === "hupari-silver"
                              ? "Silver Filigree"
                              : sample.id === "terracotta-bankura"
                                ? "Terracotta Clay"
                                : sample.id === "shilp-handicraft"
                                  ? "Block Print"
                                  : "Madhubani Art"}
              </p>
              <p className="text-[9.5px] text-[#9C9182] truncate">
                {sample.region.split(",")[0]}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
