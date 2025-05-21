"use client"

import { useRef, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { RigidBody, CapsuleCollider } from "@react-three/rapier"
import { Vector3 } from "three"
import { useGameStore } from "@/lib/store"

export default function BotPlayers() {
  const { gameState, currentMap, bots, addBot, updateBot } = useGameStore()
  const botsInitialized = useRef(false)

  // Initialize bots when game starts
  useEffect(() => {
    try {
      if (gameState === "playing" && !botsInitialized.current) {
        // Create bots based on the map
        const botCount = 11 // 12 total players including the human player

        for (let i = 0; i < botCount; i++) {
          // Determine team (half allies, half enemies)
          const team = i < botCount / 2 ? "allies" : "enemies"

          // Create random position based on map with error handling
          let position: [number, number, number] = [0, 1.8, 0]

          try {
            switch (currentMap) {
              case "urban":
                position = [(Math.random() - 0.5) * 80, 1.8, (Math.random() - 0.5) * 80]
                break
              case "forest":
                position = [(Math.random() - 0.5) * 80, 1.8, (Math.random() - 0.5) * 80]
                break
              case "facility":
                position = [(Math.random() - 0.5) * 40, 1.8, (Math.random() - 0.5) * 40]
                break
              default:
                position = [(Math.random() - 0.5) * 80, 1.8, (Math.random() - 0.5) * 80]
            }
          } catch (positionError) {
            console.error("Error generating bot position:", positionError)
            // Use default position if there's an error
            position = [0, 1.8, 0]
          }

          // Select random weapon with error handling
          let randomWeapon
          try {
            const weapons = useGameStore.getState().availableWeapons || []
            randomWeapon = weapons[Math.floor(Math.random() * weapons.length)]

            // If no weapon was found, use a default
            if (!randomWeapon) {
              randomWeapon = {
                id: "default",
                name: "Default Weapon",
                type: "assaultRifle",
                damage: 30,
                fireRate: 700,
                reloadTime: 2.5,
                maxAmmo: 30,
                currentAmmo: 30,
                reserveAmmo: 90,
                range: 80,
                recoil: 0.3,
                mobility: 0.7,
                isUnlocked: true,
                model: "default",
                level: 1,
                xp: 0,
                xpToNextLevel: 1000,
                maxLevel: 20,
                attachments: {},
                availableAttachments: [],
              }
            }
          } catch (weaponError) {
            console.error("Error selecting bot weapon:", weaponError)
            // Use a default weapon if there's an error
            randomWeapon = {
              id: "default",
              name: "Default Weapon",
              type: "assaultRifle",
              damage: 30,
              fireRate: 700,
              reloadTime: 2.5,
              maxAmmo: 30,
              currentAmmo: 30,
              reserveAmmo: 90,
              range: 80,
              recoil: 0.3,
              mobility: 0.7,
              isUnlocked: true,
              model: "default",
              level: 1,
              xp: 0,
              xpToNextLevel: 1000,
              maxLevel: 20,
              attachments: {},
              availableAttachments: [],
            }
          }

          // Add bot with error handling
          try {
            addBot({
              id: `bot-${i}`,
              name: `Bot ${i + 1}`,
              health: 100,
              position,
              rotation: [0, Math.random() * Math.PI * 2, 0],
              weapon: { ...randomWeapon },
              state: "patrolling",
              team,
            })
          } catch (addBotError) {
            console.error("Error adding bot:", addBotError)
          }
        }

        botsInitialized.current = true
      }

      // Reset flag when game ends
      if (gameState === "menu") {
        botsInitialized.current = false
      }
    } catch (error) {
      console.error("Error initializing bots:", error)
      botsInitialized.current = false
    }
  }, [gameState, currentMap, addBot])

  // Add try-catch blocks around bot updates
  useFrame(() => {
    try {
      if (gameState !== "playing") return

      // Update bot behavior
      bots.forEach((bot) => {
        try {
          if (!bot || bot.state === "dead") return

          // Simple bot AI
          if (bot.state === "patrolling") {
            // Random movement
            const randomDirection = new Vector3((Math.random() - 0.5) * 0.1, 0, (Math.random() - 0.5) * 0.1)

            const newPosition: [number, number, number] = [
              bot.position[0] + randomDirection.x,
              bot.position[1],
              bot.position[2] + randomDirection.z,
            ]

            // Random rotation
            const randomRotation: [number, number, number] = [0, bot.rotation[1] + (Math.random() - 0.5) * 0.1, 0]

            updateBot(bot.id, {
              position: newPosition,
              rotation: randomRotation,
            })
          }
        } catch (botUpdateError) {
          console.error(`Error updating bot ${bot?.id}:`, botUpdateError)
        }
      })
    } catch (error) {
      console.error("Error in bot frame update:", error)
    }
  })

  if (gameState !== "playing") return null

  return (
    <group>
      {bots.map((bot) => (
        <Bot key={bot.id} bot={bot} />
      ))}
    </group>
  )
}

// Add null checks in the Bot component
function Bot({ bot }) {
  const botRef = useRef<any>(null)

  useFrame(() => {
    try {
      if (!botRef.current || !bot || bot.state === "dead") return

      // Update bot position with null checks
      if (Array.isArray(bot.position) && bot.position.length === 3) {
        botRef.current.setTranslation({ x: bot.position[0], y: bot.position[1], z: bot.position[2] }, true)
      }
    } catch (error) {
      console.error(`Error updating bot ${bot?.id} position:`, error)
    }
  })

  if (!bot || bot.state === "dead") return null

  return (
    <RigidBody
      ref={botRef}
      position={[bot.position[0], bot.position[1], bot.position[2]]}
      enabledRotations={[false, true, false]}
      type="dynamic"
      colliders={false}
    >
      <CapsuleCollider args={[0.5, 0.8]} />

      {/* Bot model */}
      <group rotation={[0, bot.rotation[1], 0]}>
        {/* Body */}
        <mesh position={[0, 0, 0]}>
          <capsuleGeometry args={[0.5, 1, 8, 8]} />
          <meshStandardMaterial color={bot.team === "allies" ? "#4CAF50" : "#F44336"} />
        </mesh>

        {/* Head */}
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color={bot.team === "allies" ? "#388E3C" : "#D32F2F"} />
        </mesh>

        {/* Weapon */}
        <mesh position={[0.4, 0.2, -0.5]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.1, 0.1, 0.5]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      </group>
    </RigidBody>
  )
}
