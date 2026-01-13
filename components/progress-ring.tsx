"use client"

import { motion } from "framer-motion"
import { useMemo } from "react"

export function ProgressRing({ percentage }: { percentage: number }) {
  const circumference = 2 * Math.PI * 45
  const offset = circumference - (percentage / 100) * circumference

  const getColor = () => {
    if (percentage >= 80) return "text-green-500"
    if (percentage >= 50) return "text-primary"
    return "text-orange-500"
  }

  const colorClass = useMemo(() => getColor(), [percentage])

  return (
    <div className="flex flex-col items-center">
      <svg width="120" height="120" className="transform -rotate-90">
        <circle
          cx="60"
          cy="60"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted opacity-20"
        />
        <motion.circle
          cx="60"
          cy="60"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          animate={{ strokeDashoffset: offset }}
          transition={{
            duration: 1.2,
            ease: "easeOut",
            type: "spring",
            stiffness: 60,
            damping: 15,
          }}
          className={`${colorClass} transition-colors`}
          strokeLinecap="round"
        />
      </svg>
      <div className="text-center mt-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={`text-3xl font-bold ${colorClass} transition-colors`}
        >
          {percentage}%
        </motion.div>
        <p className="text-sm text-muted-foreground">complete</p>
      </div>
    </div>
  )
}
