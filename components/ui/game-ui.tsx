"use client"

import { useState, useEffect } from "react"
import { useGameStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Heart, Shield, Skull, Target, ChevronUp, Award } from "lucide-react"

export default function GameUI() {
  const { gameState, setGameState, player, score, resetGame, settings } = useGameStore()

  const [isPaused, setIsPaused] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [showWeaponLevelUp, setShowWeaponLevelUp] = useState(false)
  const [showKillStreak, setShowKillStreak] = useState(false)
  const [killStreakName, setKillStreakName] = useState("")

  // Safe access to activeWeapon
  const activeWeapon =
    Array.isArray(player?.weapons) && typeof player?.activeWeaponSlot === "number"
      ? player.weapons[player.activeWeaponSlot]
      : undefined

  // Monitor for level ups
  useEffect(() => {
    try {
      const unsubscribe = useGameStore.subscribe(
        (state) => state.player?.level,
        (newLevel, prevLevel) => {
          if (prevLevel !== undefined && newLevel !== undefined && newLevel > prevLevel) {
            setShowLevelUp(true)
            setTimeout(() => setShowLevelUp(false), 3000)
          }
        },
      )
      return unsubscribe
    } catch (error) {
      console.error("Error setting up level up subscription:", error)
      return () => {}
    }
  }, [])

  // Monitor for weapon level ups safely
  useEffect(() => {
    try {
      const unsubscribe = useGameStore.subscribe(
        (state) => {
          const activeSlot = state.player?.activeWeaponSlot
          return activeSlot !== undefined && Array.isArray(state.player?.weapons)
            ? state.player.weapons[activeSlot]?.level
            : undefined
        },
        (newLevel, prevLevel) => {
          if (prevLevel !== undefined && newLevel !== undefined && newLevel > prevLevel) {
            setShowWeaponLevelUp(true)
            setTimeout(() => setShowWeaponLevelUp(false), 3000)
          }
        },
      )
      return unsubscribe
    } catch (error) {
      console.error("Error setting up weapon level up subscription:", error)
      return () => {}
    }
  }, [])

  // Monitor for kill streaks safely
  useEffect(() => {
    try {
      const unsubscribe = useGameStore.subscribe(
        (state) => state.player?.killStreak,
        (newStreak, prevStreak) => {
          if (prevStreak !== undefined && newStreak !== undefined && newStreak > prevStreak) {
            // Ensure kill streaks is always an array
            const availableKillStreaks = Array.isArray(player?.availableKillStreaks) ? player.availableKillStreaks : []
            const availableStreak = availableKillStreaks.find((ks) => ks && ks.cost === newStreak)
            if (availableStreak) {
              setKillStreakName(availableStreak.name || "Kill Streak")
              setShowKillStreak(true)
              setTimeout(() => setShowKillStreak(false), 3000)
            }
          }
        },
      )
      return unsubscribe
    } catch (error) {
      console.error("Error setting up kill streak subscription:", error)
      return () => {}
    }
  }, [player?.availableKillStreaks])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPaused((prev) => !prev)
      }
      if (e.key === "Tab") {
        setShowControls((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Example: Safely render weapons list
  return (
    <div>
      {(Array.isArray(player?.weapons) ? player.weapons : []).map((weapon, idx) => (
        <div key={idx}>{weapon?.name}</div>
      ))}
      {/* ...rest of your UI */}
    </div>
  )
}
