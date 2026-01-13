"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Lock, Eye, EyeOff, AlertCircle } from "lucide-react"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.isAdmin) {
        localStorage.setItem("admin_token", data.token || "verified")
        router.push("/admin")
      } else {
        setError(data.message || "Access denied. You do not have admin privileges.")
      }
    } catch (err) {
      setError("Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <div className="bg-card border-2 border-border rounded-xl p-8 space-y-6">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Lock className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Admin Access</h1>
              <p className="text-muted-foreground text-sm">Restricted area - admin login required</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@cshub.dev"
                  className="w-full px-4 py-3 rounded-lg border-2 border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 rounded-lg border-2 border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-600 text-sm flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={loading || !email || !password}
                whileHover={!loading ? { scale: 1.02 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-lg font-semibold transition-all"
              >
                {loading ? "Verifying..." : "Access Admin Panel"}
              </motion.button>
            </form>

            <p className="text-center text-xs text-muted-foreground">
              This is a protected admin area. Unauthorized access is not permitted.
            </p>
          </div>
        </motion.div>
      </main>
    </>
  )
}
