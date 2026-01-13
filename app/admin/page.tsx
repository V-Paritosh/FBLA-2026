"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Users, Calendar, BookOpen, Zap, Edit2, Trash2, Plus, Eye, EyeOff, Shield, Check, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface AdminUser {
  _id: string
  email: string
  name: string
  isAdmin: boolean
  createdAt: string
  totalXP: number
}

interface AdminSession {
  _id: string
  subject: string
  description: string
  host_user_id: string
  date: string
  attendees: number
  status: "active" | "inactive"
}

interface AdminStats {
  totalUsers: number
  activeSessions: number
  totalLessons: number
  totalXPAwarded: number
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [sessions, setSessions] = useState<AdminSession[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "sessions" | "users" | "xp">("overview")
  const [editingSession, setEditingSession] = useState<AdminSession | null>(null)
  const [showNewSessionModal, setShowNewSessionModal] = useState(false)
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: "success" | "error" }[]>([])

  useEffect(() => {
    // Check for admin token before allowing access
    const adminVerified = localStorage.getItem("admin_token")
    if (!adminVerified) {
      window.location.href = "/admin/login"
    }

    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      const [statsRes, sessionsRes, usersRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/sessions"),
        fetch("/api/admin/users"),
      ])
      const statsData = await statsRes.json()
      const sessionsData = await sessionsRes.json()
      const usersData = await usersRes.json()
      setStats(statsData)
      setSessions(sessionsData)
      setUsers(usersData)
    } catch (error) {
      console.error("Failed to fetch admin data:", error)
      addNotification("Failed to load admin data", "error")
    } finally {
      setLoading(false)
    }
  }

  const addNotification = (message: string, type: "success" | "error") => {
    const id = Date.now().toString()
    setNotifications((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, 3000)
  }

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/admin/sessions/${sessionId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setSessions((prev) => prev.filter((s) => s._id !== sessionId))
        addNotification("Session deleted successfully", "success")
      }
    } catch (error) {
      console.error("Failed to delete session:", error)
      addNotification("Failed to delete session", "error")
    }
  }

  const handleToggleSessionStatus = async (sessionId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active"
      const response = await fetch(`/api/admin/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
        setSessions((prev) =>
          prev.map((s) => (s._id === sessionId ? { ...s, status: newStatus as "active" | "inactive" } : s)),
        )
        addNotification(`Session ${newStatus}`, "success")
      }
    } catch (error) {
      console.error("Failed to update session:", error)
      addNotification("Failed to update session", "error")
    }
  }

  const handleToggleAdminPrivilege = async (userId: string, currentIsAdmin: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAdmin: !currentIsAdmin }),
      })
      if (response.ok) {
        setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, isAdmin: !currentIsAdmin } : u)))
        addNotification(`Admin privileges ${!currentIsAdmin ? "granted" : "revoked"}`, "success")
      }
    } catch (error) {
      console.error("Failed to update user:", error)
      addNotification("Failed to update user privileges", "error")
    }
  }

  return (
    <div className="flex h-screen bg-background">

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Admin Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-8"
              >
                <Shield className="w-8 h-8 text-primary" />
                <div>
                  <h1 className="text-4xl font-bold text-foreground">Admin Panel</h1>
                  <p className="text-muted-foreground">Manage sessions, users, and platform metrics</p>
                </div>
              </motion.div>

              {/* Tab Navigation */}
              <div className="flex gap-2 border-b border-border overflow-x-auto">
                {(["overview", "sessions", "users", "xp"] as const).map((tab) => (
                  <motion.button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-4 py-3 font-medium text-sm capitalize transition-all border-b-2 whitespace-nowrap ${
                      activeTab === tab
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab}
                  </motion.button>
                ))}
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  {/* Overview Tab */}
                  {activeTab === "overview" && stats && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                      {[
                        { icon: Users, label: "Total Users", value: stats.totalUsers, color: "text-primary" },
                        {
                          icon: Calendar,
                          label: "Active Sessions",
                          value: stats.activeSessions,
                          color: "text-secondary",
                        },
                        { icon: BookOpen, label: "Total Lessons", value: stats.totalLessons, color: "text-blue-500" },
                        { icon: Zap, label: "XP Awarded", value: stats.totalXPAwarded, color: "text-orange-500" },
                      ].map((stat, index) => {
                        const Icon = stat.icon
                        return (
                          <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-card border border-border rounded-xl p-6"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <Icon className={`w-8 h-8 ${stat.color}`} />
                            </div>
                            <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
                            <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                          </motion.div>
                        )
                      })}
                    </motion.div>
                  )}

                  {/* Sessions Tab */}
                  {activeTab === "sessions" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-foreground">Manage Sessions</h2>
                        <motion.button
                          onClick={() => setShowNewSessionModal(true)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg"
                        >
                          <Plus className="w-4 h-4" />
                          New Session
                        </motion.button>
                      </div>

                      <div className="space-y-3">
                        {sessions.map((session, index) => (
                          <motion.div
                            key={session._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              session.status === "active" ? "border-primary bg-primary/5" : "border-muted bg-muted/20"
                            }`}
                          >
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="font-semibold text-foreground">{session.subject}</h3>
                                <p className="text-sm text-muted-foreground">{session.description}</p>
                                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                                  <span>Date: {new Date(session.date).toLocaleDateString()}</span>
                                  <span>Attendees: {session.attendees}</span>
                                  <span
                                    className={`px-2 py-1 rounded ${
                                      session.status === "active"
                                        ? "bg-green-500/20 text-green-600"
                                        : "bg-muted text-muted-foreground"
                                    }`}
                                  >
                                    {session.status}
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <motion.button
                                  onClick={() => handleToggleSessionStatus(session._id, session.status)}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className={`p-2 rounded-lg transition-all ${
                                    session.status === "active"
                                      ? "bg-green-500/20 text-green-600 hover:bg-green-500/30"
                                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                                  }`}
                                  title={session.status === "active" ? "Deactivate" : "Activate"}
                                >
                                  {session.status === "active" ? (
                                    <Eye className="w-4 h-4" />
                                  ) : (
                                    <EyeOff className="w-4 h-4" />
                                  )}
                                </motion.button>
                                <motion.button
                                  onClick={() => setEditingSession(session)}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="p-2 rounded-lg bg-blue-500/20 text-blue-600 hover:bg-blue-500/30 transition-all"
                                  title="Edit session"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </motion.button>
                                <motion.button
                                  onClick={() => handleDeleteSession(session._id)}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="p-2 rounded-lg bg-red-500/20 text-red-600 hover:bg-red-500/30 transition-all"
                                  title="Delete session"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Users Tab */}
                  {activeTab === "users" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <h2 className="text-2xl font-bold text-foreground">User Management</h2>
                      <div className="space-y-3">
                        {users.map((user, index) => (
                          <motion.div
                            key={user._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-4 rounded-lg border border-border bg-card hover:border-primary/40 transition-all"
                          >
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="font-semibold text-foreground">{user.name}</h3>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                                  <span>XP: {user.totalXP}</span>
                                  <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                                  <span
                                    className={`px-2 py-1 rounded flex items-center gap-1 ${
                                      user.isAdmin ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                                    }`}
                                  >
                                    <Shield className="w-3 h-3" />
                                    {user.isAdmin ? "Admin" : "User"}
                                  </span>
                                </div>
                              </div>
                              <motion.button
                                onClick={() => handleToggleAdminPrivilege(user._id, user.isAdmin)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`p-2 rounded-lg transition-all flex items-center gap-2 px-4 py-2 ${
                                  user.isAdmin
                                    ? "bg-green-500/20 text-green-600 hover:bg-green-500/30"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                }`}
                              >
                                {user.isAdmin ? (
                                  <>
                                    <Check className="w-4 h-4" />
                                    <span>Revoke Admin</span>
                                  </>
                                ) : (
                                  <>
                                    <X className="w-4 h-4" />
                                    <span>Grant Admin</span>
                                  </>
                                )}
                              </motion.button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* XP Tab */}
                  {activeTab === "xp" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="bg-card border border-border rounded-lg p-6"
                    >
                      <h2 className="text-2xl font-bold text-foreground mb-4">XP Management</h2>
                      <p className="text-muted-foreground">
                        View and manage user XP rewards, levels, and leaderboards...
                      </p>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Notification Toasts */}
      <AnimatePresence>
        {notifications.map((notif, idx) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, y: 20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg text-sm font-medium ${
              notif.type === "success"
                ? "bg-green-500/20 text-green-600 border border-green-500/30"
                : "bg-red-500/20 text-red-600 border border-red-500/30"
            }`}
            style={{ marginBottom: `${idx * 60}px` }}
          >
            {notif.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
