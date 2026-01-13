"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Calendar, Clock, Users, Plus, Check, Share2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Session {
  _id: string
  subject: string
  description: string
  host_user_id: string
  date: string
  attendees?: number
}

export default function SchedulePage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "upcoming" | "joined">("all")
  const [showNewSessionModal, setShowNewSessionModal] = useState(false)
  const [joinedSessions, setJoinedSessions] = useState<string[]>([])
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: "success" | "info" }[]>([])

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch("/api/sessions")
        const data = await response.json()
        setSessions(data)
      } catch (error) {
        console.error("Failed to fetch sessions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [])

  const upcomingSessions = sessions.filter((s) => new Date(s.date) > new Date())

  const displayedSessions =
    filter === "upcoming"
      ? upcomingSessions
      : filter === "joined"
        ? sessions.filter((s) => joinedSessions.includes(s._id))
        : sessions

  const handleJoinSession = (sessionId: string, sessionName: string) => {
    if (joinedSessions.includes(sessionId)) {
      setJoinedSessions((prev) => prev.filter((id) => id !== sessionId))
      addNotification(`Left ${sessionName}`, "info")
    } else {
      setJoinedSessions((prev) => [...prev, sessionId])
      addNotification(`Joined ${sessionName}!`, "success")
    }
  }

  const addNotification = (message: string, type: "success" | "info") => {
    const id = Date.now().toString()
    setNotifications((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, 3000)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div>
                  <h1 className="text-4xl font-bold text-foreground">Study Schedule</h1>
                  <p className="text-muted-foreground mt-1">Join tutoring sessions and study groups</p>
                </div>
                <motion.button
                  onClick={() => setShowNewSessionModal(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg transition-colors w-fit"
                >
                  <Plus className="w-4 h-4" />
                  Host Session
                </motion.button>
              </motion.div>

              {/* Filters */}
              <div className="flex gap-2 flex-wrap">
                {["all", "upcoming", "joined"].map((f) => (
                  <motion.button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-lg transition-all capitalize font-medium ${
                      filter === f
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "bg-card border border-border text-foreground hover:border-primary/50 hover:shadow-md"
                    }`}
                  >
                    {f}
                  </motion.button>
                ))}
              </div>

              {/* Sessions List with interactive cards */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  {filter === "upcoming" ? "Upcoming" : filter === "joined" ? "My Sessions" : "All"} Sessions
                </h2>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : displayedSessions.length > 0 ? (
                  <div className="space-y-3">
                    {displayedSessions.map((session, index) => {
                      const isJoined = joinedSessions.includes(session._id)
                      return (
                        <motion.div
                          key={session._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`rounded-lg p-4 border-2 transition-all ${
                            isJoined
                              ? "bg-primary/10 border-primary shadow-lg shadow-primary/20"
                              : "bg-card border-border hover:shadow-md"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <h3
                                  className={`font-semibold text-lg ${isJoined ? "text-primary" : "text-foreground"}`}
                                >
                                  {session.subject}
                                </h3>
                                {isJoined && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200 }}
                                  >
                                    <Check className="w-5 h-5 text-green-500" />
                                  </motion.div>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{session.description}</p>
                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(session.date).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {new Date(session.date).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  {(session.attendees || 0) + (isJoined ? 1 : 0)} attending
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <motion.button
                                onClick={() => handleJoinSession(session._id, session.subject)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`px-4 py-2 rounded-lg transition-all font-medium flex items-center gap-2 ${
                                  isJoined
                                    ? "bg-green-500/20 text-green-600 border border-green-500/30 hover:bg-green-500/30"
                                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                                }`}
                              >
                                {isJoined ? (
                                  <>
                                    <Check className="w-4 h-4" />
                                    Joined
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-4 h-4" />
                                    Join
                                  </>
                                )}
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-3 py-2 rounded-lg border border-border bg-card text-foreground hover:bg-muted transition-all"
                                title="Share session"
                              >
                                <Share2 className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-card border border-border rounded-lg p-12 text-center"
                  >
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No sessions found</h3>
                    <p className="text-muted-foreground">
                      {filter === "upcoming"
                        ? "No upcoming sessions. Host one to get started!"
                        : filter === "joined"
                          ? "You haven't joined any sessions yet"
                          : "Start by hosting your first study session"}
                    </p>
                  </motion.div>
                )}
              </div>
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
                : "bg-primary/20 text-primary border border-primary/30"
            }`}
            style={{ marginBottom: `${idx * 60}px` }}
          >
            {notif.message}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* New Session Modal */}
      {showNewSessionModal && <NewSessionModal onClose={() => setShowNewSessionModal(false)} />}
    </div>
  )
}

function NewSessionModal({ onClose }: { onClose: () => void }) {
  const [subject, setSubject] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          description,
          date: `${date}T${time}`,
        }),
      })

      if (response.ok) {
        onClose()
      }
    } catch (error) {
      console.error("Failed to create session:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-background rounded-xl border-2 border-border shadow-xl max-w-md w-full"
      >
        <div className="p-6 space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Host New Session</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., JavaScript Basics"
                required
                className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What will you cover in this session?"
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <motion.button
                type="button"
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 border-2 border-border text-foreground hover:bg-muted/50 hover:border-primary/50 py-2 rounded-lg font-semibold transition-all"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={!loading ? { scale: 1.02 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed py-2 rounded-lg font-semibold transition-all"
              >
                {loading ? "Creating..." : "Create Session"}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
