"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { BookOpen, Play, FileText, Trophy, Search } from "lucide-react"
import { motion } from "framer-motion"

const lessons = [
  {
    id: 1,
    title: "Java Basics",
    difficulty: "Beginner",
    time: "30 min",
    category: "Programming",
    icon: BookOpen,
  },
  {
    id: 2,
    title: "Python Loops",
    difficulty: "Beginner",
    time: "25 min",
    category: "Programming",
    icon: BookOpen,
  },
  {
    id: 3,
    title: "HTML/CSS Crash Course",
    difficulty: "Beginner",
    time: "45 min",
    category: "Web Dev",
    icon: BookOpen,
  },
  {
    id: 4,
    title: "SQL Starter Kit",
    difficulty: "Intermediate",
    time: "40 min",
    category: "Databases",
    icon: BookOpen,
  },
  {
    id: 5,
    title: "Cybersecurity Basics",
    difficulty: "Intermediate",
    time: "35 min",
    category: "Cybersecurity",
    icon: BookOpen,
  },
  {
    id: 6,
    title: "Machine Learning Intro",
    difficulty: "Advanced",
    time: "60 min",
    category: "ML",
    icon: BookOpen,
  },
]

const videos = [
  { id: 1, title: "Understanding Recursion", category: "Algorithms", duration: "12 min" },
  { id: 2, title: "React Hooks Deep Dive", category: "Web Dev", duration: "18 min" },
  { id: 3, title: "Binary Search Trees", category: "Data Structures", duration: "15 min" },
  { id: 4, title: "API Design Patterns", category: "Web Dev", duration: "20 min" },
]

const quizzes = [
  { id: 1, title: "Arrays & Lists Quiz", questions: 10, difficulty: "Beginner" },
  { id: 2, title: "React Concepts", questions: 15, difficulty: "Intermediate" },
  { id: 3, title: "Database Design Challenge", questions: 12, difficulty: "Advanced" },
]

export default function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<"lessons" | "videos" | "quizzes" | "cheatsheets">("lessons")

  const filteredLessons = lessons.filter((l) => l.title.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
              {/* Header */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-4xl font-bold text-foreground mb-2">Learning Resources</h1>
                <p className="text-muted-foreground">Explore lessons, videos, quizzes, and more</p>
              </motion.div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Tabs */}
              <div className="flex gap-2 border-b border-border">
                {["lessons", "videos", "quizzes", "cheatsheets"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`pb-3 px-2 border-b-2 transition-colors capitalize font-medium ${
                      activeTab === tab
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Lessons Tab */}
              {activeTab === "lessons" && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredLessons.map((lesson, index) => {
                    const Icon = lesson.icon
                    return (
                      <motion.div
                        key={lesson.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                      >
                        <Icon className="w-8 h-8 text-primary mb-3" />
                        <h3 className="font-semibold text-foreground mb-2">{lesson.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{lesson.category}</p>
                        <div className="flex items-center justify-between text-xs mb-4">
                          <span className="px-2 py-1 rounded bg-primary/10 text-primary">{lesson.difficulty}</span>
                          <span className="text-muted-foreground">{lesson.time}</span>
                        </div>
                        <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2 rounded-lg transition-colors text-sm font-medium">
                          Start Lesson
                        </button>
                      </motion.div>
                    )
                  })}
                </div>
              )}

              {/* Videos Tab */}
              {activeTab === "videos" && (
                <div className="grid md:grid-cols-2 gap-6">
                  {videos.map((video, index) => (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                    >
                      <div className="bg-gradient-to-br from-primary/20 to-secondary/20 aspect-video flex items-center justify-center">
                        <Play className="w-12 h-12 text-primary/50 group-hover:text-primary transition-colors" />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-foreground mb-1">{video.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {video.category} • {video.duration}
                        </p>
                        <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2 rounded-lg transition-colors text-sm font-medium">
                          Watch Video
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Quizzes Tab */}
              {activeTab === "quizzes" && (
                <div className="grid md:grid-cols-2 gap-6">
                  {quizzes.map((quiz, index) => (
                    <motion.div
                      key={quiz.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
                    >
                      <Trophy className="w-8 h-8 text-secondary mb-3" />
                      <h3 className="font-semibold text-foreground mb-2">{quiz.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {quiz.questions} questions • {quiz.difficulty}
                      </p>
                      <button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 py-2 rounded-lg transition-colors text-sm font-medium">
                        Start Quiz
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Cheatsheets Tab */}
              {activeTab === "cheatsheets" && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    "Python Syntax",
                    "JavaScript ES6+",
                    "SQL Commands",
                    "Git Cheatsheet",
                    "React Patterns",
                    "CSS Grid",
                  ].map((sheet, index) => (
                    <motion.div
                      key={sheet}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    >
                      <FileText className="w-8 h-8 text-primary mb-3" />
                      <h3 className="font-semibold text-foreground mb-4">{sheet}</h3>
                      <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2 rounded-lg transition-colors text-sm font-medium">
                        Download PDF
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
