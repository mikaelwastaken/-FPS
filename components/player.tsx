"use client"

import { useRef, useEffect, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { useKeyboardControls, PointerLockControls } from "@react-three/drei"
import { RigidBody, CapsuleCollider } from "@react-three/rapier"
import { Vector3 } from "three"
import { useGameStore } from "@/lib/store"

export default function Player() {
  // Use a state to track if player data is ready
  const [isPlayerReady, setIsPlayerReady] = useState(false)

  const {
    gameState,
    player,
    updatePlayer,
    fireWeapon,
    reloadWeapon,
    switchWeapon,
    throwGrenade,
    settings,
    addWeaponXP,
    addPlayerXP,
    incrementKillStreak,
    activateKillStreak,
    resetGame,
    clearStorage,
  } = useGameStore()

  const playerRef = useRef<any>(null)
  const { camera } = useThree()

  // Movement state
  const moveDirection = useRef(new Vector3())
  const currentVelocity = useRef(new Vector3())
  const jumpVelocity = useRef(0)

  // Player state
  const isJumping = useRef(false)
  const isCrouching = useRef(false)
  const isProne = useRef(false)
  const isSliding = useRef(false)
  const slideTimer = useRef(0)
  const slideDirection = useRef(new Vector3())

  // Controls setup
  const [, getKeys] = useKeyboardControls()

  // Check if player data is valid and complete - with simplified validation
  useEffect(() => {
    // Less strict validation
    const validatePlayer = () => {
      if (!player) {
        console.error("Player object is null or undefined")
        return false
      }

      try {
        return player.weapons !== undefined && player.activeWeaponSlot !== undefined
      } catch (error) {
        console.error("Error validating player:", error)
        return false
      }
    }

    if (validatePlayer()) {
      setIsPlayerReady(true)
    } else {
      console.error("Invalid player data detected, using fallback")
      // Use fallback instead of instantly resetting
      setIsPlayerReady(true)
    }
  }, [player, clearStorage])

  useEffect(() => {
    // Update camera FOV based on settings
    if (settings && typeof settings.fov === "number") {
      camera.fov = settings.fov
      camera.updateProjectionMatrix()
    }
  }, [camera, settings])

  useEffect(() => {
    // Lock pointer on game start
    if (gameState === "playing") {
      document.body.requestPointerLock()
    }

    // Setup event listeners for weapon switching
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== "playing") return

      // Weapon switching
      if (e.key === "1") switchWeapon("primary")
      if (e.key === "2") switchWeapon("secondary")
      if (e.key === "3") switchWeapon("melee")
      if (e.key === "g") throwGrenade()
      if (e.key === "r") reloadWeapon()

      // Kill streak activation
      if (e.key === "4" && player) {
        try {
          // Safely access player properties with defaults
          const availableKillStreaks = player.availableKillStreaks || []
          const activeKillStreaks = player.activeKillStreaks || []
          const killStreak = player.killStreak || 0

          // Find available streak
          const availableStreak = availableKillStreaks.find(
            (ks) => ks && ks.cost <= killStreak && !activeKillStreaks.some((active) => active && active.id === ks.id),
          )

          if (availableStreak) {
            activateKillStreak(availableStreak.id)
          }
        } catch (error) {
          console.error("Error activating kill streak:", error)
        }
      }
    }

    // Mouse click for firing
    const handleMouseDown = (e: MouseEvent) => {
      if (gameState !== "playing") return

      if (e.button === 0) {
        // Left click
        fireWeapon()

        try {
          // Add XP for firing (small amount) with null checks
          if (
            player &&
            player.activeWeaponSlot &&
            player.activeWeaponSlot !== "lethal" &&
            player.activeWeaponSlot !== "melee"
          ) {
            addWeaponXP(player.activeWeaponSlot, 1)
          }
        } catch (error) {
          console.error("Error adding weapon XP:", error)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("mousedown", handleMouseDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("mousedown", handleMouseDown)
    }
  }, [gameState, switchWeapon, fireWeapon, reloadWeapon, throwGrenade, player, activateKillStreak, addWeaponXP])

  useFrame((state, delta) => {
    if (gameState !== "playing" || !playerRef.current || !player) {
      return
    }

    try {
      // Safely access controls with fallbacks
      const controls = getKeys()
      const forward = controls.forward || false
      const backward = controls.backward || false
      const left = controls.left || false
      const right = controls.right || false
      const jump = controls.jump || false
      const crouch = controls.crouch || false
      const sprint = controls.sprint || false

      // Safely get camera direction
      const cameraDirection = new Vector3()
      if (camera) {
        camera.getWorldDirection(cameraDirection)
        cameraDirection.y = 0
        cameraDirection.normalize()
      }

      // Calculate right vector with null checks
      const rightVector = new Vector3()
      if (camera) {
        rightVector.crossVectors(camera.up, cameraDirection).normalize()
      }

      // Reset movement direction
      moveDirection.current.set(0, 0, 0)

      // Add movement based on keys
      if (forward) moveDirection.current.add(cameraDirection)
      if (backward) moveDirection.current.sub(cameraDirection)
      if (left) moveDirection.current.sub(rightVector)
      if (right) moveDirection.current.add(rightVector)

      // Normalize movement direction if moving
      if (moveDirection.current.lengthSq() > 0) {
        moveDirection.current.normalize()
      }

      // Handle jumping with more defensive coding
      const canJump = player.canJump !== undefined ? player.canJump : true
      if (jump && !isJumping.current && canJump) {
        jumpVelocity.current = 5
        isJumping.current = true
        updatePlayer({ isJumping: true, canJump: false })
      }

      // Handle crouching
      if (crouch && !isProne.current && !isSliding.current) {
        if (!isCrouching.current) {
          isCrouching.current = true
          updatePlayer({ isCrouching: true })
        } else if (sprint && moveDirection.current.lengthSq() > 0) {
          // Start sliding
          isSliding.current = true
          slideTimer.current = 1.0 // Slide duration in seconds
          slideDirection.current.copy(moveDirection.current)
          updatePlayer({ isSliding: true })
        }
      } else if (isCrouching.current && !crouch) {
        isCrouching.current = false
        updatePlayer({ isCrouching: false })
      }

      // Handle sliding
      if (isSliding.current) {
        slideTimer.current -= delta
        if (slideTimer.current <= 0) {
          isSliding.current = false
          updatePlayer({ isSliding: false })
        }
      }

      // Calculate movement speed
      let speed = 5 // Base speed

      if (isSliding.current) {
        speed = 8 * (slideTimer.current / 1.0) // Sliding speed decreases over time
        moveDirection.current.copy(slideDirection.current)
      } else if (isCrouching.current) {
        speed = 2.5 // Crouching speed
      } else if (isProne.current) {
        speed = 1 // Prone speed
      } else if (sprint && forward && !backward) {
        speed = 8 // Sprint speed
        updatePlayer({ isRunning: true })
      } else {
        updatePlayer({ isRunning: false })
      }

      // Apply movement
      const movement = moveDirection.current.clone().multiplyScalar(speed * delta)

      // Apply gravity and jumping
      jumpVelocity.current -= 9.81 * delta // Gravity

      // Update velocity
      currentVelocity.current.copy(movement)
      currentVelocity.current.y = jumpVelocity.current * delta

      // Move the player
      playerRef.current.setLinvel(
        new Vector3(currentVelocity.current.x * 10, currentVelocity.current.y * 10, currentVelocity.current.z * 10),
        true,
      )

      // Get current position
      const position = playerRef.current.translation()

      // Check if player is on ground
      if (position.y <= 1.1) {
        position.y = 1.1
        playerRef.current.setTranslation(position, true)

        if (isJumping.current) {
          isJumping.current = false
          updatePlayer({ isJumping: false, canJump: true })
        }

        jumpVelocity.current = 0
      }

      // Update player position in store
      updatePlayer({
        position: [position.x, position.y, position.z],
        isMoving: moveDirection.current.lengthSq() > 0,
      })

      // Update camera position
      camera.position.set(position.x, position.y + 0.8, position.z)
    } catch (error) {
      console.error("Error in player frame update:", error)
    }
  })

  // Don't render if game is not playing
  if (gameState !== "playing") return null

  // Use default position if player position is invalid
  const playerPosition = Array.isArray(player.position) && player.position.length === 3 ? player.position : [0, 1.8, 0]

  return (
    <>
      <PointerLockControls />
      <RigidBody
        ref={playerRef}
        position={[playerPosition[0], playerPosition[1], playerPosition[2]]}
        enabledRotations={[false, false, false]}
        type="dynamic"
        colliders={false}
        linearDamping={0.95}
        angularDamping={0.95}
      >
        <CapsuleCollider args={[0.5, 0.8]} />
      </RigidBody>
    </>
  )
}
