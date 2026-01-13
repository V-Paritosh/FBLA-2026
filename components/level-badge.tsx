"use client"

import { motion } from "framer-motion"
import { useXPStore } from "@/store/xp-store"
import { Crown } from "lucide-react"

export function LevelBadge() {
  const { level, currentLevelXP } = useXPStore()
  const progress = useXPStore((state) => state.getProgressToNextLevel(state.totalXP))

  return (
    <motion.div
      className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2"
      whileHover={{ scale: 1.05 }}
    >
      <div className="relative">
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-xs">{level}</span>
        </div>
        <Crown className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1" />
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-foreground">Level {level}</span>
        <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-secondary"
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
      </div>
    </motion.div>
  )
}
