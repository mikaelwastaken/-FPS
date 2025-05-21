"use client"

import { useEffect, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { useGameStore } from "@/lib/store"
import { useSoundStore, getRandomFootstepSound } from "@/lib/sound-manager"

export default function SoundEffects() {
  const { gameState, player, currentMap } = useGameStore()
  const { playSound, stopSound, playMusic, stopMusic } = useSoundStore()

  // Refs for tracking state changes
  const prevGameState = useRef(gameState)
  const prevMap = useRef(currentMap)
  const prevIsMoving = useRef(player.isMoving)
  const prevIsRunning = useRef(player.isRunning)
  const prevIsCrouching = useRef(player.isCrouching)
  const prevIsProne = useRef(player.isProne)
  const prevIsJumping = useRef(player.isJumping)
  const prevActiveWeaponSlot = useRef(player.activeWeaponSlot)

  // Timers for recurring sounds
  const footstepTimer = useRef(0)
  const ambientSoundTimer = useRef(0)

  // Handle game state changes
  useEffect(() => {
    if (prevGameState.current !== gameState) {
      if (gameState === "menu") {
        // Play menu music
        playMusic("menu_music")
      } else if (gameState === "playing") {
        // Stop menu music and play game start sound
        stopMusic()
        playSound("ui", "game_start")

        // Start ambient sounds based on map
        startAmbientSounds()

        // Play game music after a short delay
        setTimeout(() => {
          playMusic("combat_music")
        }, 3000)
      } else if (gameState === "paused") {
        // Lower music volume when paused
        useSoundStore.getState().setCategoryVolume("music", 0.2)
      }

      prevGameState.current = gameState
    }
  }, [gameState, playMusic, playSound, stopMusic])

  // Handle map changes
  useEffect(() => {
    if (prevMap.current !== currentMap && gameState === "playing") {
      // Stop previous ambient sounds
      stopAmbientSounds()

      // Start new ambient sounds
      startAmbientSounds()

      prevMap.current = currentMap
    }
  }, [currentMap, gameState])

  // Handle weapon switching
  useEffect(() => {
    if (prevActiveWeaponSlot.current !== player.activeWeaponSlot && gameState === "playing") {
      // Play weapon switch sound
      const activeWeapon = player.weapons[player.activeWeaponSlot]
      if (activeWeapon) {
        playSound("weapon", "weapon_switch")
      }

      prevActiveWeaponSlot.current = player.activeWeaponSlot
    }
  }, [player.activeWeaponSlot, player.weapons, gameState, playSound])

  // Start ambient sounds based on current map
  const startAmbientSounds = () => {
    switch (currentMap) {
      case "urban":
        playSound("environment", "urban_ambient", { loop: true, volume: 0.5 })
        break
      case "forest":
        playSound("environment", "forest_ambient", { loop: true, volume: 0.5 })
        playSound("environment", "wind_light", { loop: true, volume: 0.3 })
        break
      case "facility":
        playSound("environment", "facility_ambient", { loop: true, volume: 0.5 })
        break
    }
  }

  // Stop all ambient sounds
  const stopAmbientSounds = () => {
    stopSound("urban_ambient")
    stopSound("forest_ambient")
    stopSound("facility_ambient")
    stopSound("wind_light")
    stopSound("wind_strong")
    stopSound("rain_light")
    stopSound("rain_heavy")
  }

  // Handle player movement sounds
  useFrame((state, delta) => {
    if (gameState !== "playing") return

    // Handle footstep sounds
    if (player.isMoving && !player.isJumping) {
      footstepTimer.current -= delta

      if (footstepTimer.current <= 0) {
        // Determine surface type based on map
        let surfaceType: "concrete" | "grass" | "metal" = "concrete"

        switch (currentMap) {
          case "urban":
            surfaceType = "concrete"
            break
          case "forest":
            surfaceType = "grass"
            break
          case "facility":
            surfaceType = "metal"
            break
        }

        // Get random footstep sound for the surface
        const footstepSound = getRandomFootstepSound(surfaceType)

        // Adjust volume and pitch based on movement state
        let volume = 0.3
        let pitch = 1.0
        let interval = 0.5

        if (player.isRunning) {
          volume = 0.5
          pitch = 1.1
          interval = 0.3
        } else if (player.isCrouching) {
          volume = 0.1
          pitch = 0.9
          interval = 0.7
        } else if (player.isProne) {
          volume = 0.05
          pitch = 0.8
          interval = 1.0
        }

        // Play footstep sound
        playSound("player", footstepSound, { volume, pitch })

        // Reset timer for next footstep
        footstepTimer.current = interval
      }
    }

    // Handle jumping/landing sounds
    if (player.isJumping && !prevIsJumping.current) {
      playSound("player", "jump", { volume: 0.4 })
    } else if (!player.isJumping && prevIsJumping.current) {
      playSound("player", "land", { volume: 0.5 })
    }

    // Handle crouch/prone sounds
    if (player.isCrouching && !prevIsCrouching.current) {
      playSound("player", "crouch_down", { volume: 0.3 })
    } else if (!player.isCrouching && prevIsCrouching.current) {
      playSound("player", "crouch_up", { volume: 0.3 })
    }

    if (player.isProne && !prevIsProne.current) {
      playSound("player", "prone_down", { volume: 0.4 })
    } else if (!player.isProne && prevIsProne.current) {
      playSound("player", "prone_up", { volume: 0.4 })
    }

    // Random ambient sounds
    ambientSoundTimer.current -= delta
    if (ambientSoundTimer.current <= 0) {
      // Play random ambient sounds based on map
      if (currentMap === "urban") {
        // Urban ambient sounds (distant gunfire, explosions, etc.)
        if (Math.random() < 0.3) {
          playSound("environment", "gunfire_distant", { volume: 0.2 })
        } else if (Math.random() < 0.1) {
          playSound("environment", "explosion_distant_1", { volume: 0.3 })
        }
      } else if (currentMap === "forest") {
        // Forest ambient sounds (thunder, wind gusts, etc.)
        if (Math.random() < 0.1) {
          playSound("environment", "thunder_1", { volume: 0.4 })
        } else if (Math.random() < 0.2) {
          playSound("environment", "wind_strong", { volume: 0.3, duration: 3000 })
        }
      }

      // Reset timer for next ambient sound (10-30 seconds)
      ambientSoundTimer.current = 10 + Math.random() * 20
    }

    // Update previous state refs
    prevIsMoving.current = player.isMoving
    prevIsRunning.current = player.isRunning
    prevIsCrouching.current = player.isCrouching
    prevIsProne.current = player.isProne
    prevIsJumping.current = player.isJumping
  })

  // Clean up sounds when component unmounts
  useEffect(() => {
    return () => {
      stopAmbientSounds()
      stopMusic()
    }
  }, [stopMusic])

  return null
}
