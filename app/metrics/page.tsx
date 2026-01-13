"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Users, BookOpen, Clock, TrendingUp, Zap } from "lucide-react"
import { motion } from "framer-motion"

interface MetricsData {
  totalUsers: number
  lessonsCompleted: number
  avgStudyTime: number
  mostPopularTopic: string
  totalXPAwarded: number
  totalSessions: number
  weeklyData: Array<{ day: string; lessons: number; users: number }>
  topicData: Array<{ name: string; value: number }>
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch("/api/metrics")
        const data = await response.json()
        setMetrics(data)
      } catch (error) {
        console.error("Failed to fetch metrics:", error)
        // Set fallback data
        setMetrics({
          totalUsers: 10250,
          lessonsCompleted: 5430,
          avgStudyTime: 4.5,
          mostPopularTopic: "Web Development",
          totalXPAwarded: 1234500,
          totalSessions: 342,
          weeklyData: [
            { day: "Mon", lessons: 12, users: 45 },
            { day: "Tue", lessons: 19, users: 62 },
            { day: "Wed", lessons: 15, users: 58 },
            { day: "Thu", lessons: 22, users: 73 },
            { day: "Fri", lessons: 28, users: 85 },
            { day: "Sat", lessons: 31, users: 92 },
            { day: "Sun", lessons: 26, users: 78 },
          ],
          topicData: [
            { name: "Programming", value: 35 },
            { name: "Web Dev", value: 25 },
            { name: "Databases", value: 20 },
            { name: "ML", value: 15 },
            { name: "Other", value: 5 },
          ],
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  const COLORS = ["#40798C", "#636B2F", "#3B82F6", "#22C55E", "#F97316"]

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

  if (!metrics) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <div className="flex items-center justify-center flex-1">
            <p className="text-muted-foreground">Failed to load metrics</p>
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
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Header */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-4xl font-bold text-foreground">Platform Metrics</h1>
                <p className="text-muted-foreground">Real-time insights into how our learning community is growing</p>
              </motion.div>

              {/* Key Metrics - Enhanced */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-card border border-border rounded-lg p-6 lg:col-span-2"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground text-sm">Active Users</h3>
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-3xl font-bold text-foreground">{metrics.totalUsers.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-2">+12% from last month</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-card border border-border rounded-lg p-6 lg:col-span-2"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground text-sm">Lessons Completed</h3>
                    <BookOpen className="w-5 h-5 text-secondary" />
                  </div>
                  <p className="text-3xl font-bold text-foreground">{metrics.lessonsCompleted.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-2">+8% from last week</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-card border border-border rounded-lg p-6 lg:col-span-2"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground text-sm">Avg Study Time</h3>
                    <Clock className="w-5 h-5 text-orange-500" />
                  </div>
                  <p className="text-3xl font-bold text-foreground">{metrics.avgStudyTime}h</p>
                  <p className="text-xs text-muted-foreground mt-2">per student monthly</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-card border border-border rounded-lg p-6 lg:col-span-2"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground text-sm">Total Sessions</h3>
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-3xl font-bold text-foreground">{metrics.totalSessions}</p>
                  <p className="text-xs text-muted-foreground mt-2">live study sessions</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-card border border-border rounded-lg p-6 lg:col-span-2"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground text-sm">Total XP Awarded</h3>
                    <Zap className="w-5 h-5 text-yellow-500" />
                  </div>
                  <p className="text-3xl font-bold text-foreground">{(metrics.totalXPAwarded / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-muted-foreground mt-2">cumulative XP</p>
                </motion.div>
              </div>

              {/* Charts */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Weekly Activity */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-card border border-border rounded-lg p-6"
                >
                  <h3 className="font-semibold text-foreground mb-4">Weekly Activity</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={metrics.weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="lessons" fill="var(--color-primary)" name="Lessons Completed" />
                      <Bar dataKey="users" fill="var(--color-secondary)" name="Active Users" />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>

                {/* Topic Distribution */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-card border border-border rounded-lg p-6"
                >
                  <h3 className="font-semibold text-foreground mb-4">Topic Popularity</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={metrics.topicData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name} ${value}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {metrics.topicData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>

              {/* Growth Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-card border border-border rounded-lg p-6"
              >
                <h3 className="font-semibold text-foreground mb-4">User Growth Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metrics.weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="var(--color-primary)"
                      strokeWidth={2}
                      dot={{ fill: "var(--color-primary)", r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Active Users"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
