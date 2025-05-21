"use client"

import { useRef, useEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { useGameStore } from "@/lib/store"
import { useSoundStore } from "@/lib/sound-manager"
import { Vector3 } from "three"
import FirstPersonWeapon from "@/components/weapons/first-person-weapon"
import Projectiles from "@/components/weapons/projectiles"

export default function WeaponSystem() {
  const { gameState, player, fireWeapon, reloadWeapon, addWeaponXP, addPlayerXP, incrementKillStreak } = useGameStore()
  const { playSound, getWeaponSound } = useSoundStore()
  const { camera } = useThree()

  const lastFireTime = useRef(0)
  const isFiring = useRef(false)
  const isReloading = useRef(false)
  const reloadStage = useRef<"start" | "mid" | "end" | null>(null)
  const reloadTimer = useRef(0)
  const projectilesRef = useRef<any>(null)

  // Handle weapon firing
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (gameState !== "playing" || isReloading.current) return

      if (e.button === 0) {
        // Left click
        isFiring.current = true
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        isFiring.current = false
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== "playing") return

      // Reload on 'R' key
      if (e.key === "r" && !isReloading.current) {
        startReload()
      }
    }

    window.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("mouseup", handleMouseUp)
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mouseup", handleMouseUp)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [gameState])

  // Start the reload process
  const startReload = () => {
    try {
      const activeWeapon = player?.weapons?.[player?.activeWeaponSlot]

      if (
        !activeWeapon ||
        isReloading.current ||
        activeWeapon.currentAmmo === activeWeapon.maxAmmo ||
        activeWeapon.reserveAmmo <= 0 ||
        activeWeapon.type === "knife" ||
        activeWeapon.type === "grenade"
      ) {
        return
      }

      isReloading.current = true
      reloadStage.current = "start"

      // Play reload start sound with error handling
      try {
        const soundId = getWeaponSound(activeWeapon.type, "reload_start")
        playSound("weapon", soundId)
      } catch (soundError) {
        console.error("Error playing reload sound:", soundError)
      }

      // Set timer for mid-reload stage
      reloadTimer.current = 0.3
    } catch (error) {
      console.error("Error starting reload:", error)
      // Reset reload state to prevent getting stuck
      isReloading.current = false
      reloadStage.current = null
    }
  }

  // Process reload stages
  const processReload = (delta) => {
    if (!isReloading.current) return

    try {
      reloadTimer.current -= delta

      if (reloadTimer.current <= 0) {
        const activeWeapon = player?.weapons?.[player?.activeWeaponSlot]

        if (!activeWeapon) {
          isReloading.current = false
          reloadStage.current = null
          return
        }

        if (reloadStage.current === "start") {
          // Move to mid-reload stage
          reloadStage.current = "mid"
          try {
            const soundId = getWeaponSound(activeWeapon.type, "reload_mid")
            playSound("weapon", soundId)
          } catch (soundError) {
            console.error("Error playing reload mid sound:", soundError)
          }
          reloadTimer.current = 0.5
        } else if (reloadStage.current === "mid") {
          // Move to end-reload stage
          reloadStage.current = "end"
          try {
            const soundId = getWeaponSound(activeWeapon.type, "reload_end")
            playSound("weapon", soundId)
          } catch (soundError) {
            console.error("Error playing reload end sound:", soundError)
          }
          reloadTimer.current = 0.2
        } else if (reloadStage.current === "end") {
          // Complete reload
          reloadWeapon()
          isReloading.current = false
          reloadStage.current = null
        }
      }
    } catch (error) {
      console.error("Error processing reload:", error)
      // Reset reload state to prevent getting stuck
      isReloading.current = false
      reloadStage.current = null
    }
  }

  useFrame(({ clock }, delta) => {
    if (gameState !== "playing") return

    try {
      const activeWeapon = player?.weapons?.[player?.activeWeaponSlot || "primary"]

      // Process reload animation
      processReload(delta)

      // Handle weapon firing with null checks
      if (isFiring.current && activeWeapon && !isReloading.current) {
        const currentTime = clock.getElapsedTime()
        const fireInterval = activeWeapon.fireRate ? 60 / activeWeapon.fireRate : 0.5 // Default if fireRate is missing

        if (currentTime - lastFireTime.current >= fireInterval) {
          // Fire the weapon with null checks
          if (activeWeapon.currentAmmo > 0) {
            fireWeapon()

            // Play weapon fire sound with error handling
            try {
              const soundId = getWeaponSound(activeWeapon.type, "fire")
              playSound("weapon", soundId)
            } catch (soundError) {
              console.error("Error playing weapon sound:", soundError)
            }

            // Create projectile/bullet with null checks
            if (projectilesRef.current && camera) {
              try {
                const direction = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion)

                // Calculate weapon stats with attachments and null checks
                let finalDamage = activeWeapon.damage || 10 // Default if missing
                let finalRange = activeWeapon.range || 50 // Default if missing
                let finalRecoil = activeWeapon.recoil || 0.2 // Default if missing

                // Apply attachment effects with null checks
                const attachments = activeWeapon.attachments || {}
                Object.values(attachments).forEach((attachment) => {
                  if (attachment && attachment.stats) {
                    if (attachment.stats.damage) finalDamage *= 1 + attachment.stats.damage
                    if (attachment.stats.range) finalRange *= 1 + attachment.stats.range
                    if (attachment.stats.recoil) finalRecoil *= 1 + attachment.stats.recoil
                  }
                })

                // Add some random spread based on weapon recoil
                const spread = finalRecoil * 0.05
                direction.x += (Math.random() - 0.5) * spread
                direction.y += (Math.random() - 0.5) * spread
                direction.z += (Math.random() - 0.5) * spread

                direction.normalize()

                projectilesRef.current.createProjectile(
                  new Vector3().copy(camera.position),
                  direction,
                  activeWeapon.type,
                  finalDamage,
                  finalRange,
                )
              } catch (projectileError) {
                console.error("Error creating projectile:", projectileError)
              }
            }
          } else {
            // Play empty weapon sound with error handling
            try {
              const soundId = getWeaponSound(activeWeapon.type, "empty")
              playSound("weapon", soundId)
            } catch (soundError) {
              console.error("Error playing empty weapon sound:", soundError)
            }

            // Auto-reload if enabled with null checks
            const settings = useGameStore.getState().settings
            if (activeWeapon.reserveAmmo > 0 && settings?.controls?.autoReload) {
              startReload()
            }
          }

          lastFireTime.current = currentTime
        }
      }
    } catch (error) {
      console.error("Error in weapon system frame update:", error)
    }
  })

  // Handle hit detection and XP rewards
  const handleHit = (botId: string, damage: number, isHeadshot: boolean) => {
    // Play hit sound
    playSound("player", isHeadshot ? "hit_2" : "hit_1")

    // Add XP for hit
    const hitXP = isHeadshot ? 50 : 20
    addWeaponXP(player.activeWeaponSlot, hitXP)

    // Add player XP
    addPlayerXP(hitXP)

    // If kill, add more XP and increment kill streak
    if (isHeadshot || damage >= 100) {
      // Play kill confirmed sound
      playSound("ui", "kill_confirmed")

      const killXP = isHeadshot ? 150 : 100
      addWeaponXP(player.activeWeaponSlot, killXP)
      addPlayerXP(killXP)
      incrementKillStreak()
    }
  }

  if (gameState !== "playing") return null

  return (
    <>
      <FirstPersonWeapon isReloading={isReloading.current} reloadStage={reloadStage.current} />
      <Projectiles ref={projectilesRef} onHit={handleHit} />
    </>
  )
}
