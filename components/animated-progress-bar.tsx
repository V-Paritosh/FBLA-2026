"use client"

import { motion } from "framer-motion"
import { useMemo } from "react"

interface AnimatedProgressBarProps {
  percentage: number
  label: string
  showPercentage?: boolean
}

export function AnimatedProgressBar({ percentage, label, showPercentage = true }: AnimatedProgressBarProps) {
  const getBarColor = () => {
    if (percentage >= 80) return "from-green-500 to-emerald-500"
    if (percentage >= 50) return "from-primary to-cyan-400"
    return "from-orange-500 to-amber-500"
  }

  const barColor = useMemo(() => getBarColor(), [percentage])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        {showPercentage && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-semibold text-foreground"
          >
            {percentage}%
          </motion.span>
        )}
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${barColor} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: 1.5,
            ease: "easeOut",
            type: "spring",
            stiffness: 40,
            damping: 12,
          }}
        />
      </div>
    </div>
  )
}
