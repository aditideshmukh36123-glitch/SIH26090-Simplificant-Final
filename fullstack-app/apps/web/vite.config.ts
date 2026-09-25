import { defineConfig, Plugin } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function mockApiPlugin(): Plugin {
  return {
    name: "mock-api-service",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const rawUrl = req.url || ""
        if (!rawUrl.startsWith("/api/v1") && !rawUrl.startsWith("/api/ai")) {
          return next()
        }

        const url = new URL(rawUrl, `http://${req.headers.host || "localhost"}`)
        const pathname = url.pathname

        res.setHeader("Content-Type", "application/json")

        // ─── /api/v1 routes ──────────────────────────────────────────────────
        if (pathname === "/api/v1/products" && req.method === "GET") {
          res.statusCode = 200
          res.end(
            JSON.stringify({
              success: true,
              data: {
                items: [],
                total: 0,
              },
            }),
          )
          return
        }

        if (pathname === "/api/v1/products" && req.method === "POST") {
          let body = ""
          req.on("data", (chunk: any) => {
            body += chunk
          })
          req.on("end", () => {
            try {
              const parsed = JSON.parse(body || "{}")
              res.statusCode = 201
              res.end(
                JSON.stringify({
                  success: true,
                  data: {
                    id: Date.now(),
                    ...parsed,
                    status: "APPROVED",
                  },
                }),
              )
            } catch {
              res.statusCode = 400
              res.end(
                JSON.stringify({
                  success: false,
                  error: { message: "Invalid JSON" },
                }),
              )
            }
          })
          return
        }

        if (pathname === "/api/v1/orders" && req.method === "POST") {
          let body = ""
          req.on("data", (chunk: any) => {
            body += chunk
          })
          req.on("end", () => {
            try {
              const parsed = JSON.parse(body || "{}")
              res.statusCode = 201
              res.end(
                JSON.stringify({
                  success: true,
                  data: {
                    id: `ORD-2026-${Math.floor(100000 + Math.random() * 900000)}`,
                    status: "CONFIRMED",
                    ...parsed,
                  },
                }),
              )
            } catch {
              res.statusCode = 400
              res.end(
                JSON.stringify({
                  success: false,
                  error: { message: "Invalid JSON" },
                }),
              )
            }
          })
          return
        }

        if (pathname === "/api/v1/auth/login" && req.method === "POST") {
          let body = ""
          req.on("data", (chunk: any) => {
            body += chunk
          })
          req.on("end", () => {
            try {
              const parsed = JSON.parse(body || "{}")
              const cleanId = (parsed.identifier || "artisan").toLowerCase()
              const role = cleanId.includes("delivery")
                ? "delivery"
                : cleanId.includes("producer")
                ? "producer"
                : cleanId.includes("admin")
                ? "admin"
                : cleanId.includes("buyer")
                ? "buyer"
                : "seller"

              res.statusCode = 200
              res.end(
                JSON.stringify({
                  success: true,
                  data: {
                    user: {
                      id: `USR-${Date.now().toString().slice(-4)}`,
                      name: parsed.identifier?.split("@")[0] || "Simplificant User",
                      email: parsed.identifier?.includes("@")
                        ? parsed.identifier
                        : `${cleanId}@simplificant.in`,
                      role,
                      giCluster: "National GI Craft Cluster",
                    },
                    accessToken: "token_" + Date.now(),
                    refreshToken: "refresh_" + Date.now(),
                  },
                }),
              )
            } catch {
              res.statusCode = 400
              res.end(
                JSON.stringify({
                  success: false,
                  error: { message: "Invalid login request" },
                }),
              )
            }
          })
          return
        }

        if (pathname === "/api/v1/auth/register" && req.method === "POST") {
          let body = ""
          req.on("data", (chunk: any) => {
            body += chunk
          })
          req.on("end", () => {
            try {
              const parsed = JSON.parse(body || "{}")
              res.statusCode = 201
              res.end(
                JSON.stringify({
                  success: true,
                  data: {
                    user: {
                      id: `USR-${Date.now().toString().slice(-4)}`,
                      name: parsed.name || "Simplificant User",
                      email:
                        parsed.email ||
                        `${parsed.phone || "user"}@simplificant.in`,
                      role: parsed.role || "buyer",
                      giCluster: parsed.city || "Craft Cluster",
                    },
                    accessToken: "token_" + Date.now(),
                    refreshToken: "refresh_" + Date.now(),
                  },
                }),
              )
            } catch {
              res.statusCode = 400
              res.end(
                JSON.stringify({
                  success: false,
                  error: { message: "Invalid registration" },
                }),
              )
            }
          })
          return
        }

        // ─── /api/ai fallback ────────────────────────────────────────────────
        if (rawUrl.startsWith("/api/ai")) {
          res.statusCode = 200
          res.end(
            JSON.stringify({
              status: "offline",
              message: "In-browser studio enhancement active",
            }),
          )
          return
        }

        // ─── Catch-all for other /api/v1 endpoints ────────────────────────────
        res.statusCode = 200
        res.end(JSON.stringify({ success: true, data: null }))
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), mockApiPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    host: "0.0.0.0",
    allowedHosts: true,
  },
})
