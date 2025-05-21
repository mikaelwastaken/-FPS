"use client"

import { useRef } from "react"
import { useGameStore } from "@/lib/store"

export default function KillStreakSystem() {
  const { gameState, player, deactivateKillStreak } = useGameStore()
  
  // Track active kill streaks and their timers
  const killStreakTimers = useRef<Map<string, number>>(new Map())

// Initialize or update tim
