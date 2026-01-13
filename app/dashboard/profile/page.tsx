"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Settings, LogOut, Zap, Award, TrendingUp, Edit2, Save, X, Check } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

interface UserProfile {
  name: string
  email: string
  joinedDate: string
  xp: number
  streak: number
  completedModules: number
  interests?: string[]
  experienceLevel?: "beginner" | "intermediate" | "advanced"
  learningGoals?: string[]
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState<Partial<UserProfile>>({})
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const interests = ["Programming", "Web Dev", "Cybersecurity", "Databases", "Machine Learning", "Algorithms"]
  const experienceLevels = ["beginner", "intermediate", "advanced"]
  const goals = [
    "Build projects",
    "Learn fundamentals",
    "Prepare for competitions",
    "Prepare for AP CSA",
    "Prep for internship interviews",
    "Prep for hackathons",
  ]

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/profile")
        const data = await response.json()
        setProfile(data)
        setEditData(data)
      } catch (error) {
        console.error("Failed to fetch profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
  }

  const handleSaveChanges = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/profile/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      })

      if (response.ok) {
        const updated = await response.json()
        setProfile(updated)
        setEditMode(false)
      }
    } catch (error) {
      console.error("Failed to save profile:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <div className="flex items-center justify-center flex-1">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-8">
            <div className="max-w-3xl mx-auto space-y-8">
              {/* Profile Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border border-primary/20 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">{profile?.name}</h1>
                    <p className="text-muted-foreground">{profile?.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Member since</p>
                    <p className="text-foreground font-semibold">{profile?.joinedDate}</p>
                  </div>
                </div>
              </motion.div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-card border border-border rounded-lg p-4 text-center"
                >
                  <Zap className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{profile?.xp}</p>
                  <p className="text-xs text-muted-foreground">Total XP</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-card border border-border rounded-lg p-4 text-center"
                >
                  <TrendingUp className="w-6 h-6 text-secondary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{profile?.streak}</p>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-card border border-border rounded-lg p-4 text-center"
                >
                  <Award className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{profile?.completedModules}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </motion.div>
              </div>

              {/* Learning Preferences - Editable */}
              {!editMode ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-foreground">Learning Preferences</h2>
                    <motion.button
                      onClick={() => setEditMode(true)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </motion.button>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-4 space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Your Interests</p>
                      <div className="flex flex-wrap gap-2">
                        {(profile?.interests || []).map((interest) => (
                          <span key={interest} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Experience Level</p>
                      <p className="px-3 py-1 bg-secondary/20 text-secondary rounded-full text-sm w-fit capitalize">
                        {profile?.experienceLevel || "Not set"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Learning Goals</p>
                      <div className="flex flex-wrap gap-2">
                        {(profile?.learningGoals || []).map((goal) => (
                          <span key={goal} className="px-3 py-1 bg-orange-500/20 text-orange-600 rounded-full text-sm">
                            {goal}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 bg-card border border-border rounded-lg p-6"
                >
                  <h2 className="text-xl font-bold text-foreground">Edit Learning Preferences</h2>

                  {/* Interests */}
                  <div>
                    <p className="text-sm font-medium text-foreground mb-3">Your Interests</p>
                    <div className="grid grid-cols-2 gap-2">
                      {interests.map((interest) => (
                        <motion.button
                          key={interest}
                          onClick={() => {
                            const current = editData.interests || []
                            setEditData({
                              ...editData,
                              interests: current.includes(interest)
                                ? current.filter((i) => i !== interest)
                                : [...current, interest],
                            })
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                            (editData.interests || []).includes(interest)
                              ? "bg-primary/20 border-primary text-primary"
                              : "bg-muted border-border text-foreground hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{interest}</span>
                            {(editData.interests || []).includes(interest) && <Check className="w-4 h-4" />}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Experience Level */}
                  <div>
                    <p className="text-sm font-medium text-foreground mb-3">Experience Level</p>
                    <div className="grid grid-cols-3 gap-2">
                      {experienceLevels.map((level) => (
                        <motion.button
                          key={level}
                          onClick={() => setEditData({ ...editData, experienceLevel: level as any })}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-3 rounded-lg border-2 transition-all text-sm font-medium capitalize ${
                            editData.experienceLevel === level
                              ? "bg-secondary/20 border-secondary text-secondary"
                              : "bg-muted border-border text-foreground hover:border-secondary/50"
                          }`}
                        >
                          {level}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Learning Goals */}
                  <div>
                    <p className="text-sm font-medium text-foreground mb-3">Learning Goals</p>
                    <div className="space-y-2">
                      {goals.map((goal) => (
                        <motion.label
                          key={goal}
                          whileHover={{ scale: 1.01 }}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={(editData.learningGoals || []).includes(goal)}
                            onChange={() => {
                              const current = editData.learningGoals || []
                              setEditData({
                                ...editData,
                                learningGoals: current.includes(goal)
                                  ? current.filter((g) => g !== goal)
                                  : [...current, goal],
                              })
                            }}
                            className="w-4 h-4 rounded border-border cursor-pointer"
                          />
                          <span className="text-sm text-foreground">{goal}</span>
                        </motion.label>
                      ))}
                    </div>
                  </div>

                  {/* Save/Cancel Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-border">
                    <motion.button
                      onClick={() => setEditMode(false)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 border-2 border-border text-foreground hover:bg-muted/50 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </motion.button>
                    <motion.button
                      onClick={handleSaveChanges}
                      disabled={saving}
                      whileHover={!saving ? { scale: 1.02 } : {}}
                      whileTap={!saving ? { scale: 0.98 } : {}}
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? "Saving..." : "Save Changes"}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Settings
                </h2>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full bg-destructive/10 border border-destructive/30 text-destructive hover:bg-destructive/20 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </motion.div>

              {/* Danger Zone */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 space-y-3"
              >
                <h3 className="font-semibold text-destructive">Danger Zone</h3>
                <button className="w-full bg-destructive/10 border border-destructive/30 text-destructive hover:bg-destructive/20 px-4 py-2 rounded-lg transition-colors text-sm font-medium">
                  Delete Account
                </button>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
