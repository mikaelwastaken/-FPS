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

  // Add null checks for player data
  const activeWeapon = player?.weapons?.[player?.activeWeaponSlot]

  // Monitor for level ups
  useEffect(() => {
    try {
      const unsubscribe = useGameStore.subscribe(
        (state) => state.player.level,
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

  // Add null checks for weapon level ups
  useEffect(() => {
    try {
      const unsubscribe = useGameStore.subscribe(
        (state) => {
          const activeSlot = state.player.activeWeaponSlot
          return activeSlot && state.player.weapons[activeSlot]?.level
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

  // Add null checks for kill streaks
  useEffect(() => {
    try {
      const unsubscribe = useGameStore.subscribe(
        (state) => state.player.killStreak,
        (newStreak, prevStreak) => {
          if (prevStreak !== undefined && newStreak !== undefined && newStreak > prevStreak) {
            // Check if any kill streak is available at this count
            const availableKillStreaks = player?.availableKillStreaks || []
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
        setIsPaused(!isPaused)
        setGameState(isPaused ? "playing" : "paused")
      }

      if (e.key === "Tab") {
        setShowControls(true)
        e.preventDefault()
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        setShowControls(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [isPaused, setGameState])

  if (gameState !== "playing" && gameState !== "paused") {
    return null
  }

  return (
    <>
      {/* Custom Crosshair */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
        {settings.crosshair.style === "default" && (
          <div className="relative">
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: `${settings.crosshair.thickness}px`,
                height: `${settings.crosshair.size * 2}px`,
                backgroundColor: settings.crosshair.color,
                transform: "translate(-50%, -50%)",
                opacity: settings.crosshair.opacity,
              }}
            ></div>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: `${settings.crosshair.size * 2}px`,
                height: `${settings.crosshair.thickness}px`,
                backgroundColor: settings.crosshair.color,
                transform: "translate(-50%, -50%)",
                opacity: settings.crosshair.opacity,
              }}
            ></div>
            {settings.crosshair.dot && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "2px",
                  height: "2px",
                  backgroundColor: settings.crosshair.color,
                  transform: "translate(-50%, -50%)",
                  opacity: settings.crosshair.opacity,
                }}
              ></div>
            )}
          </div>
        )}

        {settings.crosshair.style === "dot" && (
          <div
            style={{
              width: `${settings.crosshair.size * 2}px`,
              height: `${settings.crosshair.size * 2}px`,
              backgroundColor: settings.crosshair.color,
              borderRadius: "50%",
              opacity: settings.crosshair.opacity,
            }}
          ></div>
        )}

        {settings.crosshair.style === "cross" && (
          <div className="relative">
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: `${settings.crosshair.thickness}px`,
                height: `${settings.crosshair.size * 2}px`,
                backgroundColor: settings.crosshair.color,
                transform: "translate(-50%, -50%)",
                opacity: settings.crosshair.opacity,
              }}
            ></div>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: `${settings.crosshair.size * 2}px`,
                height: `${settings.crosshair.thickness}px`,
                backgroundColor: settings.crosshair.color,
                transform: "translate(-50%, -50%)",
                opacity: settings.crosshair.opacity,
              }}
            ></div>
          </div>
        )}

        {settings.crosshair.style === "circle" && (
          <div
            style={{
              width: `${settings.crosshair.size * 2}px`,
              height: `${settings.crosshair.size * 2}px`,
              border: `${settings.crosshair.thickness}px solid ${settings.crosshair.color}`,
              borderRadius: "50%",
              opacity: settings.crosshair.opacity,
            }}
          >
            {settings.crosshair.dot && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  width: "2px",
                  height: "2px",
                  backgroundColor: settings.crosshair.color,
                  transform: "translate(-50%, -50%)",
                }}
              ></div>
            )}
          </div>
        )}
      </div>

      {/* Health and Armor */}
      <div className="fixed left-8 bottom-8 flex items-center space-x-4">
        <div className="flex items-center">
          <Heart className="h-6 w-6 text-red-500 mr-2" />
          <div className="w-32 h-3 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 rounded-full"
              style={{
                width: `${player?.health && player?.maxHealth ? (player.health / player.maxHealth) * 100 : 0}%`,
              }}
            />
          </div>
          <span className="ml-2 text-white font-medium">{player?.health || 0}</span>
        </div>

        <div className="flex items-center">
          <Shield className="h-6 w-6 text-blue-400 mr-2" />
          <div className="w-32 h-3 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-400 rounded-full"
              style={{ width: `${player?.armor ? (player.armor / 100) * 100 : 0}%` }}
            />
          </div>
          <span className="ml-2 text-white font-medium">{player?.armor || 0}</span>
        </div>
      </div>

      {/* Weapon and Ammo */}
      <div className="fixed right-8 bottom-8">
        <div className="flex flex-col items-end">
          <h3 className="text-white font-bold text-xl mb-1">{activeWeapon?.name || "No Weapon"}</h3>
          <div className="flex items-center">
            <span className="text-white text-2xl font-bold">{activeWeapon?.currentAmmo || 0}</span>
            <span className="text-gray-400 mx-1">/</span>
            <span className="text-gray-400 text-lg">{activeWeapon?.reserveAmmo || 0}</span>
          </div>
          {activeWeapon && (
            <div className="mt-1 w-48">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Level {activeWeapon.level || 1}</span>
                <span>
                  {activeWeapon.xp || 0} / {activeWeapon.xpToNextLevel || 1000} XP
                </span>
              </div>
              <Progress
                value={
                  activeWeapon.xp !== undefined && activeWeapon.xpToNextLevel
                    ? (activeWeapon.xp / activeWeapon.xpToNextLevel) * 100
                    : 0
                }
                className="h-1"
              />
            </div>
          )}
        </div>
      </div>

      {/* Score and Kill Streak */}
      <div className="fixed top-8 right-8">
        <div className="bg-black bg-opacity-50 px-4 py-2 rounded-md">
          <div className="flex items-center">
            <Skull className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-white font-bold">{score}</span>
          </div>
          <div className="flex items-center mt-1">
            <Target className="h-5 w-5 text-yellow-500 mr-2" />
            <span className="text-white font-bold">{player?.killStreak}</span>
          </div>
        </div>
      </div>

      {/* Player Level */}
      <div className="fixed top-8 left-8">
        <div className="bg-black bg-opacity-50 px-4 py-2 rounded-md">
          <div className="flex items-center">
            <Award className="h-5 w-5 text-yellow-500 mr-2" />
            <span className="text-white font-bold">Level {player?.level}</span>
            {player?.prestige > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-yellow-500 text-black text-xs font-bold rounded">
                P{player.prestige}
              </span>
            )}
          </div>
          <div className="mt-1 w-48">
            <Progress value={(player?.xp / player?.xpToNextLevel) * 100} className="h-1" />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{player?.xp} XP</span>
              <span>{player?.xpToNextLevel} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Kill Streaks */}
      <div className="fixed left-1/2 bottom-8 transform -translate-x-1/2">
        <div className="flex space-x-2">
          {(player?.availableKillStreaks || [])
            .filter((ks) => ks && ks.cost <= 10) // Only show the first few kill streaks
            .sort((a, b) => (a && b ? a.cost - b.cost : 0))
            .map(
              (killStreak) =>
                killStreak && (
                  <div key={killStreak.id} className="text-center">
                    <div
                      className={`w-12 h-12 rounded-md flex items-center justify-center ${
                        player?.killStreak >= killStreak.cost
                          ? "bg-yellow-500 text-black"
                          : "bg-gray-800 bg-opacity-70 text-gray-400"
                      }`}
                    >
                      <span className="font-bold">{killStreak.cost}</span>
                    </div>
                    <span className="text-xs text-white mt-1 block">{killStreak.name}</span>
                  </div>
                ),
            )}
        </div>
      </div>

      {/* Level Up Notification */}
      {showLevelUp && (
        <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black px-6 py-3 rounded-md animate-bounce">
          <div className="flex items-center">
            <ChevronUp className="h-6 w-6 mr-2" />
            <span className="text-xl font-bold">
              LEVEL UP! {player?.level - 1} → {player?.level}
            </span>
          </div>
        </div>
      )}

      {/* Weapon Level Up Notification */}
      {showWeaponLevelUp && activeWeapon && (
        <div className="fixed top-1/3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-6 py-3 rounded-md animate-bounce">
          <div className="flex items-center">
            <ChevronUp className="h-6 w-6 mr-2" />
            <span className="text-xl font-bold">
              {activeWeapon.name} LEVEL UP! {activeWeapon.level}
            </span>
          </div>
          <p className="text-sm">New attachments unlocked!</p>
        </div>
      )}

      {/* Kill Streak Notification */}
      {showKillStreak && (
        <div className="fixed top-2/5 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-md animate-bounce">
          <div className="flex items-center">
            <Target className="h-6 w-6 mr-2" />
            <span className="text-xl font-bold">{killStreakName} AVAILABLE!</span>
          </div>
          <p className="text-sm text-center">Press 4 to activate</p>
        </div>
      )}

      {/* Controls Overlay (when Tab is pressed) */}
      {showControls && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center pointer-events-none">
          <div className="max-w-2xl w-full p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-4">Players</h2>
            <div className="space-y-2">
              {/* Player list would go here */}
              <div className="flex justify-between bg-gray-800 bg-opacity-50 p-2 rounded">
                <span className="text-white">Player1</span>
                <span className="text-white">15</span>
              </div>
              <div className="flex justify-between bg-gray-800 bg-opacity-50 p-2 rounded">
                <span className="text-white">Player2</span>
                <span className="text-white">12</span>
              </div>
              <div className="flex justify-between bg-gray-800 bg-opacity-50 p-2 rounded">
                <span className="text-white">Player3</span>
                <span className="text-white">8</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pause Menu */}
      <Dialog
        open={isPaused}
        onOpenChange={(open) => {
          setIsPaused(open)
          setGameState(open ? "paused" : "playing")
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">Game Paused</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col space-y-3">
            <Button
              size="lg"
              onClick={() => {
                setIsPaused(false)
                setGameState("playing")
              }}
            >
              Resume Game
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                resetGame()
              }}
            >
              Quit to Main Menu
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
