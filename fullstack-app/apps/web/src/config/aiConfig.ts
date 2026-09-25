/**
 * ==============================================================================
 * AI CONFIGURATION & API KEY REGISTRY
 * ==============================================================================
 *
 * Supports:
 * - Groq Vision API (keys starting with "gsk_")
 * - Google Gemini Vision API (keys starting with "AIza")
 * - OpenAI Vision API (keys starting with "sk-")
 * - Custom Microservice Endpoint (FastAPI / Express proxy)
 * - Deterministic Indian Craft Guild Valuation fallback
 */

const FALLBACK_API_KEY = ""

export const AI_CONFIG = {
  /**
   * Reads from .env (VITE_AI_API_KEY) or falls back to FALLBACK_API_KEY
   */
  apiKey: (import.meta.env.VITE_AI_API_KEY || FALLBACK_API_KEY).trim(),

  /**
   * User configured model name or default
   */
  modelName: (import.meta.env.VITE_AI_MODEL_NAME || "").trim(),

  /**
   * Optional custom prediction endpoint
   */
  predictionEndpoint:
    import.meta.env.VITE_AI_PREDICTION_ENDPOINT ||
    "http://127.0.0.1:8000/api/predict-price",

  /**
   * Optional custom image enhance endpoint. Defaults to the same-origin Vite
   * proxy (`/api/ai` -> ai-microservice `:8000/api`), so it works both on the
   * laptop and inside the Android WebView via the cloudflared tunnel.
   */
  enhanceEndpoint:
    import.meta.env.VITE_AI_ENHANCE_ENDPOINT || "/api/ai/enhance-image",

  /**
   * Helper to check if a valid user key has been configured
   */
  hasUserApiKey(): boolean {
    return Boolean(
      this.apiKey &&
        this.apiKey !== "YOUR_API_KEY_HERE" &&
        this.apiKey.length > 8,
    )
  },

  /**
   * Auto-detect the AI provider based on API key prefix or model name
   */
  getProvider(): "groq" | "gemini" | "openai" | "custom" | "heuristic" {
    if (!this.hasUserApiKey()) return "heuristic"
    if (this.apiKey.startsWith("gsk_")) return "groq"
    if (this.apiKey.startsWith("AIza")) return "gemini"
    if (this.apiKey.startsWith("sk-")) return "openai"
    return "custom"
  },

  /**
   * Human-friendly name of the active AI model provider
   */
  getProviderName(): string {
    const provider = this.getProvider()
    switch (provider) {
      case "groq":
        return "Groq Llama-3.2 Multimodal Vision"
      case "gemini":
        return "Google Gemini 1.5 Flash Multimodal Vision"
      case "openai":
        return "OpenAI GPT-4o-mini Vision"
      case "custom":
        return "Custom AI Microservice"
      default:
        return "MoSJE GI Guild Knowledge Engine"
    }
  },

  /**
   * Resolve active vision model string
   */
  getActiveVisionModel(): string {
    if (this.modelName && this.modelName !== "YOUR_MODEL_HERE") {
      return this.modelName
    }
    const provider = this.getProvider()
    if (provider === "groq") return "llama-3.2-11b-vision-preview"
    if (provider === "gemini") return "gemini-1.5-flash"
    if (provider === "openai") return "gpt-4o-mini"
    return "craft-vision-v2"
  },

  /**
   * Standardized Authorization headers to send with requests
   */
  getAuthHeaders(): Record<string, string> {
    if (!this.hasUserApiKey()) return {}
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "x-api-key": this.apiKey,
    }
  },
}
