"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Code2, BookOpen, Shield, Database, Brain, Zap, CheckCircle2 } from "lucide-react"

const interests = [
  { id: "programming", label: "Programming", icon: Code2 },
  { id: "webdev", label: "Web Development", icon: BookOpen },
  { id: "cybersecurity", label: "Cybersecurity", icon: Shield },
  { id: "databases", label: "Databases", icon: Database },
  { id: "ml", label: "Machine Learning", icon: Brain },
  { id: "algorithms", label: "Algorithms", icon: Zap },
]

const experienceLevels = ["Beginner", "Intermediate", "Advanced"]

const learningGoals = [
  "Build projects",
  "Learn fundamentals",
  "Prepare for competitions",
  "Prepare for AP CSA",
  "Prep for internship interviews",
  "Prep for hackathons",
]

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [selectedLevel, setSelectedLevel] = useState<string>("")
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) => (prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]))
  }

  const handleComplete = async () => {
    if (!selectedLevel) {
      alert("Please select an experience level")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interests: selectedInterests,
          experienceLevel: selectedLevel.toLowerCase(),
          learningGoals: selectedGoals,
        }),
      })

      if (response.ok) {
        router.push("/dashboard")
      } else {
        alert("Failed to complete onboarding")
      }
    } catch (error) {
      console.error("Onboarding error:", error)
      alert("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-background via-card to-background px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Progress indicator */}
          <div className="flex gap-2 mb-12 justify-center">
            {[1, 2, 3].map((s) => (
              <motion.div
                key={s}
                className={`h-2 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-border"}`}
                animate={{ width: s <= step ? "40px" : "10px" }}
              />
            ))}
          </div>

          {/* Step 1: Learning Interests */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: step === 1 ? 1 : 0, y: step === 1 ? 0 : 20 }}
            transition={{ duration: 0.3 }}
            className={step === 1 ? "" : "hidden"}
          >
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">What interests you?</h2>
                <p className="text-muted-foreground">Select the topics you want to learn</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {interests.map((interest) => {
                  const Icon = interest.icon
                  const isSelected = selectedInterests.includes(interest.id)
                  return (
                    <motion.button
                      key={interest.id}
                      onClick={() => toggleInterest(interest.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? "border-primary bg-primary/15 shadow-lg shadow-primary/20"
                          : "border-border bg-card hover:border-primary/50 hover:shadow-md"
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 mb-2 mx-auto transition-colors ${
                          isSelected ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                      <p className={`font-medium transition-colors ${isSelected ? "text-primary" : "text-foreground"}`}>
                        {interest.label}
                      </p>
                    </motion.button>
                  )
                })}
              </div>

              <motion.button
                onClick={() => setStep(2)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3 rounded-lg font-semibold transition-colors"
              >
                Next
              </motion.button>
            </div>
          </motion.div>

          {/* Step 2: Experience Level */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: step === 2 ? 1 : 0, y: step === 2 ? 0 : 20 }}
            transition={{ duration: 0.3 }}
            className={step === 2 ? "" : "hidden"}
          >
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Your experience level</h2>
                <p className="text-muted-foreground">Help us personalize your learning path</p>
              </div>

              <div className="space-y-3">
                {experienceLevels.map((level) => (
                  <motion.button
                    key={level}
                    onClick={() => setSelectedLevel(level)}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      selectedLevel === level
                        ? "border-primary bg-primary/15 shadow-lg shadow-primary/20"
                        : "border-border bg-card hover:border-primary/50 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p
                        className={`font-semibold transition-colors ${
                          selectedLevel === level ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {level}
                      </p>
                      {selectedLevel === level && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200 }}
                        >
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={() => setStep(1)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 border-2 border-border text-foreground hover:bg-muted/50 hover:border-primary/50 py-3 rounded-lg font-semibold transition-all"
                >
                  Back
                </motion.button>
                <motion.button
                  onClick={() => setStep(3)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 py-3 rounded-lg font-semibold transition-colors"
                >
                  Next
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Step 3: Learning Goals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: step === 3 ? 1 : 0, y: step === 3 ? 0 : 20 }}
            transition={{ duration: 0.3 }}
            className={step === 3 ? "" : "hidden"}
          >
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Your learning goals</h2>
                <p className="text-muted-foreground">What do you want to achieve?</p>
              </div>

              <div className="grid gap-3">
                {learningGoals.map((goal, index) => (
                  <motion.button
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-lg border-2 text-left transition-all flex items-center justify-between ${
                      selectedGoals.includes(goal)
                        ? "border-primary bg-primary/15 shadow-lg shadow-primary/20"
                        : "border-border bg-card hover:border-primary/50 hover:shadow-md"
                    }`}
                  >
                    <p
                      className={`font-medium transition-colors ${
                        selectedGoals.includes(goal) ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {goal}
                    </p>
                    {selectedGoals.includes(goal) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={() => setStep(2)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 border-2 border-border text-foreground hover:bg-muted/50 hover:border-primary/50 py-3 rounded-lg font-semibold transition-all"
                >
                  Back
                </motion.button>
                <motion.button
                  onClick={handleComplete}
                  disabled={loading}
                  whileHover={!loading ? { scale: 1.02 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-lg font-semibold transition-colors"
                >
                  {loading ? "Getting ready..." : "Complete Setup"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </>
  )
}
