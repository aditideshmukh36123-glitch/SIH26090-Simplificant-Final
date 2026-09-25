import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "node:path"
import { fileURLToPath } from "node:url"
import fs from "node:fs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// The Simplificant image-enhancer microservice enforces an X-API-Key header on
// every route. The laptop-side proxy injects it (server-side) so the browser /
// Android WebView never needs to hold the key or know it exists.
function readServiceApiKey(): string {
  const envPath = path.resolve(
    __dirname,
    "../../../image-enhanced-updated/.env",
  )
  try {
    const contents = fs.readFileSync(envPath, "utf-8")
    const m = /^X_API_KEY=(.+)$/m.exec(contents)
    return m ? m[1].trim().replace(/^"|"$/g, "") : ""
  } catch {
    return ""
  }
}
const AI_X_API_KEY = readServiceApiKey()

function aiProxy() {
  const base = {
    target: "http://localhost:8000",
    changeOrigin: true,
    rewrite: (p: string) => p.replace(/^\/api\/ai/, "/api"),
  }
  if (!AI_X_API_KEY) return base
  return {
    ...base,
    configure: (proxy: any) => {
      proxy.on("proxyReq", (proxyReq: any) => {
        proxyReq.setHeader("X-API-Key", AI_X_API_KEY)
      })
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    host: true,
    // Allow the public tunnel host so the web app can be reached through
    // cloudflared / trycloudflare (Vite blocks unknown Host headers by default)
    allowedHosts: ["trycloudflare.com", ".trycloudflare.com"],
    proxy: {
      "/api/v1": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
      "/api/ai": aiProxy(),
    },
  },
})
