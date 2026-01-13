"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { ProgressRing } from "@/components/progress-ring";
import { ProjectCard } from "@/components/project-card";
import { Plus, Flame, Award, BookOpen } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Project {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  modules: any[];
  createdAt: string;
  updatedAt: string;
}

interface DashboardData {
  userName: string;
  completionPercentage: number;
  completedModules: number;
  totalModules: number;
  streak: number;
  xp: number;
  projects: Project[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>({
    userName: "User",
    completionPercentage: 0,
    completedModules: 0,
    totalModules: 0,
    streak: 0,
    xp: 0,
    projects: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch projects from API
        const response = await fetch("/api/projects");
        const projects = await response.json();

        // Global stats based on all project modules (same logic as project page)
        const totalModules = projects.reduce(
          (sum: number, p: Project) => sum + (p.modules?.length || 0),
          0
        );
        const completedModules = projects.reduce(
          (sum: number, p: Project) =>
            sum + (p.modules?.filter((m: any) => m.completed).length || 0),
          0
        );
        const completionPercentage =
          totalModules > 0
            ? Math.round((completedModules / totalModules) * 100)
            : 0;

        setData({
          userName: "User", // Replace with real user data if available
          completionPercentage,
          completedModules,
          totalModules,
          streak: 5, // Example streak, replace with real value if needed
          xp: completedModules * 10, // Example XP calculation
          projects,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard/projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-8">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : data ? (
              <div className="space-y-8">
                {/* Welcome Banner */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 text-primary-foreground"
                >
                  <h1 className="text-3xl font-bold mb-2">
                    Welcome back, {data.userName}!
                  </h1>
                  <p className="opacity-90">
                    Keep up the great work on your CS learning journey
                  </p>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Completion */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-card border border-border rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-foreground">
                        Overall Progress
                      </h3>
                      <Award className="w-5 h-5 text-primary" />
                    </div>
                    <ProgressRing percentage={data.completionPercentage} />
                    <p className="mt-3 text-sm text-muted-foreground text-center">
                      {data.completedModules} of {data.totalModules} modules completed
                    </p>
                  </motion.div>

                  {/* Streak */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-card border border-border rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-foreground">Streak</h3>
                      <Flame className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="text-4xl font-bold text-foreground">
                      {data.streak}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      days of learning
                    </p>
                  </motion.div>

                  {/* XP */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-card border border-border rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-foreground">
                        XP Points
                      </h3>
                      <BookOpen className="w-5 h-5 text-secondary" />
                    </div>
                    <div className="text-4xl font-bold text-foreground">
                      {data.xp}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      earned this month
                    </p>
                  </motion.div>
                </div>

                {/* Projects Section */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-foreground">
                      Your Projects
                    </h2>
                    <Link
                      href="/dashboard/new-project"
                      className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      New Project
                    </Link>
                  </div>

                  {data.projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {data.projects.map((project, index) => (
                        <motion.div
                          key={project.id ?? project._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <ProjectCard project={project} />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-card border border-border rounded-xl p-12 text-center">
                      <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        No projects yet
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Start your first learning project
                      </p>
                      <Link
                        href="/dashboard/new-project"
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Create Project
                      </Link>
                    </div>
                  )}
                </div>

                {/* Recommended Topics */}
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-6">
                    Recommended For You
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-foreground">
                            Advanced JavaScript
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Based on your web dev interest
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-primary">
                        View Course →
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-foreground">
                            Data Structures Mastery
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Improve your algorithms skills
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-primary">
                        View Course →
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                Failed to load dashboard
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
