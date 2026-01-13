"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, CheckCircle2 } from "lucide-react"

interface ProjectCardProps {
  project: {
    id?: string
    _id?: string
    title: string
    description: string
    modules?: { completed: boolean }[]
  }
}

export function ProjectCard({ project }: ProjectCardProps) {
  const completedCount = project.modules?.filter((m) => m.completed).length || 0
  const totalCount = project.modules?.length || 0
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const projectId = project.id ?? project._id

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer group"
    >
      <Link href={`/project/${projectId}`} className="block">
        <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          {project.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-muted-foreground">
              {completedCount} of {totalCount} completed
            </span>
            <span className="text-sm font-semibold text-primary">{progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-primary to-secondary h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-primary">
            <CheckCircle2 className="w-4 h-4" />
            <span>View Details</span>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </Link>
    </motion.div>
  )
}
