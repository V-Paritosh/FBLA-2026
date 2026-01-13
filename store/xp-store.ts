import { create } from "zustand"
import { subscribeWithSelector } from "zustand/react"

interface XPReward {
  id: string
  amount: number
  reason: string
  timestamp: number
}

interface XPState {
  totalXP: number
  currentLevelXP: number
  level: number
  rewards: XPReward[]
  addXP: (amount: number, reason: string) => void
  getLevelFromXP: (xp: number) => number
  getProgressToNextLevel: (xp: number) => number
  clearRewards: () => void
}

const XP_PER_LEVEL = 500

export const useXPStore = create<XPState>()(
  subscribeWithSelector((set, get) => ({
    totalXP: 0,
    currentLevelXP: 0,
    level: 1,
    rewards: [],

    addXP: (amount: number, reason: string) => {
      set((state) => {
        const newTotal = state.totalXP + amount
        const newLevel = Math.floor(newTotal / XP_PER_LEVEL) + 1
        const newCurrentLevelXP = newTotal % XP_PER_LEVEL

        const newReward: XPReward = {
          id: `${Date.now()}-${Math.random()}`,
          amount,
          reason,
          timestamp: Date.now(),
        }

        return {
          totalXP: newTotal,
          level: newLevel,
          currentLevelXP: newCurrentLevelXP,
          rewards: [newReward, ...state.rewards].slice(0, 20),
        }
      })
    },

    getLevelFromXP: (xp: number) => {
      return Math.floor(xp / XP_PER_LEVEL) + 1
    },

    getProgressToNextLevel: (xp: number) => {
      return (xp % XP_PER_LEVEL) / XP_PER_LEVEL
    },

    clearRewards: () => {
      set({ rewards: [] })
    },
  })),
)
