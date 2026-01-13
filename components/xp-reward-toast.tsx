"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useXPStore } from "@/store/xp-store"
import { useEffect, useState } from "react"
import { Zap } from "lucide-react"

export function XPRewardToast() {
  const rewards = useXPStore((state) => state.rewards)
  const [displayedRewards, setDisplayedRewards] = useState<string[]>([])

  useEffect(() => {
    const newRewardIds = rewards.filter((r) => !displayedRewards.includes(r.id)).map((r) => r.id)

    if (newRewardIds.length > 0) {
      setDisplayedRewards((prev) => [...prev, ...newRewardIds])

      const timer = setTimeout(() => {
        setDisplayedRewards([])
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [rewards, displayedRewards])

  const currentReward = rewards.find((r) => displayedRewards.includes(r.id))

  return (
    <AnimatePresence>
      {currentReward && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <div className="bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg p-4 shadow-lg flex items-center gap-3">
            <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }} transition={{ duration: 0.6, repeat: 2 }}>
              <Zap className="w-5 h-5" />
            </motion.div>
            <div>
              <p className="font-semibold text-sm">+{currentReward.amount} XP</p>
              <p className="text-xs opacity-90">{currentReward.reason}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
