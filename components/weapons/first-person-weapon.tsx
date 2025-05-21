"use client"

import { useRef, useEffect, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { useGameStore } from "@/lib/store"
import { type Group, Vector3, MathUtils } from "three"

interface FirstPersonWeaponProps {
  isReloading?: boolean
  reloadStage?: "start" | "mid" | "end" | null
}

export default function FirstPersonWeapon({ isReloading = false, reloadStage = null }: FirstPersonWeaponProps) {
  const { gameState, player, fireWeapon } = useGameStore()
  const { camera } = useThree()

  const weaponRef = useRef<Group>(null)
  const targetPosition = useRef(new Vector3(0.3, -0.3, -0.5))
  const currentRecoil = useRef(0)
  const lastFireTime = useRef(0)

  // Animation states
  const [reloadAnimation, setReloadAnimation] = useState({
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    positionY: 0,
  })

  useFrame(({ clock }, delta) => {
    if (!weaponRef.current || gameState !== "playing") return

    const activeWeapon = player.weapons[player.activeWeaponSlot]
    if (!activeWeapon) return

    // Position the weapon in front of the camera
    weaponRef.current.position.copy(targetPosition.current)

    // Apply weapon sway based on movement
    if (player.isMoving) {
      const swayAmount = player.isRunning ? 0.03 : 0.01
      const swaySpeed = player.isRunning ? 5 : 3

      weaponRef.current.position.y += Math.sin(clock.getElapsedTime() * swaySpeed) * swayAmount
      weaponRef.current.position.x += Math.cos(clock.getElapsedTime() * swaySpeed) * swayAmount * 0.5
    }

    // Apply recoil recovery
    if (currentRecoil.current > 0) {
      currentRecoil.current *= 0.9
      weaponRef.current.position.z += currentRecoil.current
      weaponRef.current.rotation.x -= currentRecoil.current * 0.5
    }

    // Apply reload animation
    if (isReloading) {
      let targetRotationX = 0
      const targetRotationY = 0
      let targetRotationZ = 0
      let targetPositionY = 0

      switch (reloadStage) {
        case "start":
          // Tilt weapon down and to the side
          targetRotationX = 0.3
          targetRotationZ = 0.2
          targetPositionY = -0.1
          break
        case "mid":
          // Rotate weapon for magazine change
          targetRotationX = 0.4
          targetRotationZ = -0.1
          targetPositionY = -0.15
          break
        case "end":
          // Return to normal position with slight movement
          targetRotationX = 0.2
          targetRotationZ = 0.1
          targetPositionY = -0.05
          break
      }

      // Smoothly interpolate to target values
      setReloadAnimation((prev) => ({
        rotationX: MathUtils.lerp(prev.rotationX, targetRotationX, delta * 10),
        rotationY: MathUtils.lerp(prev.rotationY, targetRotationY, delta * 10),
        rotationZ: MathUtils.lerp(prev.rotationZ, targetRotationZ, delta * 10),
        positionY: MathUtils.lerp(prev.positionY, targetPositionY, delta * 10),
      }))

      // Apply reload animation
      weaponRef.current.rotation.x += reloadAnimation.rotationX
      weaponRef.current.rotation.y += reloadAnimation.rotationY
      weaponRef.current.rotation.z += reloadAnimation.rotationZ
      weaponRef.current.position.y += reloadAnimation.positionY
    } else {
      // Reset reload animation when not reloading
      setReloadAnimation({
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        positionY: 0,
      })
    }

    // Make the weapon follow camera rotation
    weaponRef.current.quaternion.copy(camera.quaternion)
  })

  // Handle weapon recoil
  useEffect(() => {
    // Subscribe to weapon firing
    const unsubscribe = useGameStore.subscribe(
      (state) => state.player.weapons[state.player.activeWeaponSlot]?.currentAmmo,
      (currentAmmo, prevAmmo) => {
        if (currentAmmo !== undefined && prevAmmo !== undefined && currentAmmo < prevAmmo) {
          // Weapon was fired, apply recoil
          const activeWeapon = useGameStore.getState().player.weapons[useGameStore.getState().player.activeWeaponSlot]

          if (activeWeapon) {
            // Calculate recoil with attachments
            let finalRecoil = activeWeapon.recoil

            // Apply attachment effects
            Object.values(activeWeapon.attachments).forEach((attachment) => {
              if (attachment && attachment.stats.recoil) {
                finalRecoil *= 1 + attachment.stats.recoil
              }
            })

            currentRecoil.current = finalRecoil * 0.05
            lastFireTime.current = Date.now()
          }
        }
      },
    )

    return unsubscribe
  }, [])

  if (gameState !== "playing") return null

  const activeWeapon = player.weapons[player.activeWeaponSlot]
  if (!activeWeapon) return null

  return (
    <group ref={weaponRef}>
      {/* Render different weapon models based on the active weapon */}
      {activeWeapon.type === "assaultRifle" && <AssaultRifleModel weapon={activeWeapon} isReloading={isReloading} />}
      {activeWeapon.type === "submachineGun" && <SubmachineGunModel weapon={activeWeapon} isReloading={isReloading} />}
      {activeWeapon.type === "shotgun" && <ShotgunModel weapon={activeWeapon} isReloading={isReloading} />}
      {activeWeapon.type === "sniperRifle" && <SniperRifleModel weapon={activeWeapon} isReloading={isReloading} />}
      {activeWeapon.type === "lightMachineGun" && (
        <LightMachineGunModel weapon={activeWeapon} isReloading={isReloading} />
      )}
      {activeWeapon.type === "pistol" && <PistolModel weapon={activeWeapon} isReloading={isReloading} />}
      {activeWeapon.type === "knife" && <KnifeModel />}
      {activeWeapon.type === "grenade" && <GrenadeModel />}
    </group>
  )
}

interface WeaponModelProps {
  weapon: any
  isReloading?: boolean
}

// Weapon models with attachments
function AssaultRifleModel({ weapon, isReloading = false }: WeaponModelProps) {
  // Reference for magazine animation
  const magazineRef = useRef<any>(null)

  useFrame((_, delta) => {
    if (magazineRef.current && isReloading) {
      // Animate magazine dropping during reload
      magazineRef.current.position.y = -0.1 - Math.sin(Date.now() * 0.005) * 0.05
    } else if (magazineRef.current) {
      // Reset position when not reloading
      magazineRef.current.position.y = -0.1
    }
  })

  return (
    <group>
      {/* Main body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.1, 0.1, 0.5]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Barrel */}
      <mesh position={[0, 0, -0.3]}>
        <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#222222" />
      </mesh>

      {/* Magazine */}
      <mesh ref={magazineRef} position={[0, -0.1, 0]}>
        <boxGeometry args={[0.08, 0.15, 0.05]} />
        <meshStandardMaterial color="#444444" />
      </mesh>

      {/* Stock */}
      <mesh position={[0, 0, 0.2]}>
        <boxGeometry args={[0.08, 0.06, 0.2]} />
        <meshStandardMaterial color="#555555" />
      </mesh>

      {/* Render attachments */}
      {weapon.attachments.sight && <SightAttachment type={weapon.attachments.sight.id} />}
      {weapon.attachments.barrel && <BarrelAttachment type={weapon.attachments.barrel.id} />}
      {weapon.attachments.underbarrel && <UnderbarrelAttachment type={weapon.attachments.underbarrel.id} />}
    </group>
  )
}

function SubmachineGunModel({ weapon, isReloading = false }: WeaponModelProps) {
  // Reference for magazine animation
  const magazineRef = useRef<any>(null)

  useFrame((_, delta) => {
    if (magazineRef.current && isReloading) {
      // Animate magazine dropping during reload
      magazineRef.current.position.y = -0.1 - Math.sin(Date.now() * 0.005) * 0.05
    } else if (magazineRef.current) {
      // Reset position when not reloading
      magazineRef.current.position.y = -0.1
    }
  })

  return (
    <group>
      {/* Main body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.08, 0.08, 0.35]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Barrel */}
      <mesh position={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.015, 0.015, 0.2, 8]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#222222" />
      </mesh>

      {/* Magazine */}
      <mesh ref={magazineRef} position={[0, -0.1, 0]}>
        <boxGeometry args={[0.06, 0.12, 0.04]} />
        <meshStandardMaterial color="#444444" />
      </mesh>

      {/* Stock */}
      <mesh position={[0, 0, 0.15]}>
        <boxGeometry args={[0.06, 0.05, 0.1]} />
        <meshStandardMaterial color="#555555" />
      </mesh>

      {/* Render attachments */}
      {weapon.attachments.sight && <SightAttachment type={weapon.attachments.sight.id} />}
      {weapon.attachments.barrel && <BarrelAttachment type={weapon.attachments.barrel.id} />}
      {weapon.attachments.underbarrel && <UnderbarrelAttachment type={weapon.attachments.underbarrel.id} />}
    </group>
  )
}

function ShotgunModel({ weapon, isReloading = false }: WeaponModelProps) {
  // Reference for reload animation
  const barrelRef = useRef<any>(null)

  useFrame((_, delta) => {
    if (barrelRef.current && isReloading) {
      // Animate shotgun break-action during reload
      barrelRef.current.rotation.x = Math.sin(Date.now() * 0.003) * 0.2
    } else if (barrelRef.current) {
      // Reset rotation when not reloading
      barrelRef.current.rotation.x = 0
    }
  })

  return (
    <group>
      {/* Main body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.12, 0.12, 0.3]} />
        <meshStandardMaterial color="#5D4037" />
      </mesh>

      {/* Barrel */}
      <group ref={barrelRef}>
        <mesh position={[0, 0, -0.35]}>
          <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#222222" />
        </mesh>
      </group>

      {/* Stock */}
      <mesh position={[0, 0, 0.25]}>
        <boxGeometry args={[0.1, 0.08, 0.3]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Render attachments */}
      {weapon.attachments.sight && <SightAttachment type={weapon.attachments.sight.id} />}
      {weapon.attachments.barrel && <BarrelAttachment type={weapon.attachments.barrel.id} />}
    </group>
  )
}

function SniperRifleModel({ weapon, isReloading = false }: WeaponModelProps) {
  // Reference for bolt action animation
  const boltRef = useRef<any>(null)

  useFrame((_, delta) => {
    if (boltRef.current && isReloading) {
      // Animate bolt action during reload
      const time = Date.now() * 0.003
      if (time % 2 < 1) {
        boltRef.current.position.z = 0.1 + Math.sin(time * Math.PI) * 0.1
      } else {
        boltRef.current.position.z = 0.1
      }
    } else if (boltRef.current) {
      // Reset position when not reloading
      boltRef.current.position.z = 0.1
    }
  })

  return (
    <group>
      {/* Main body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.1, 0.1, 0.7]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Barrel */}
      <mesh position={[0, 0, -0.4]}>
        <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#222222" />
      </mesh>

      {/* Bolt action */}
      <mesh ref={boltRef} position={[0.05, 0, 0.1]}>
        <boxGeometry args={[0.02, 0.02, 0.1]} />
        <meshStandardMaterial color="#555555" />
      </mesh>

      {/* Default Scope (if no sight attachment) */}
      {!weapon.attachments.sight && (
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.15, 8]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
      )}

      {/* Stock */}
      <mesh position={[0, 0, 0.3]}>
        <boxGeometry args={[0.08, 0.06, 0.3]} />
        <meshStandardMaterial color="#555555" />
      </mesh>

      {/* Render attachments */}
      {weapon.attachments.sight && <SightAttachment type={weapon.attachments.sight.id} />}
      {weapon.attachments.barrel && <BarrelAttachment type={weapon.attachments.barrel.id} />}
    </group>
  )
}

function LightMachineGunModel({ weapon, isReloading = false }: WeaponModelProps) {
  // Reference for magazine animation
  const magazineRef = useRef<any>(null)

  useFrame((_, delta) => {
    if (magazineRef.current && isReloading) {
      // Animate magazine dropping during reload
      magazineRef.current.position.y = -0.15 - Math.sin(Date.now() * 0.005) * 0.1
      magazineRef.current.rotation.z = Math.sin(Date.now() * 0.003) * 0.2
    } else if (magazineRef.current) {
      // Reset position when not reloading
      magazineRef.current.position.y = -0.15
      magazineRef.current.rotation.z = 0
    }
  })

  return (
    <group>
      {/* Main body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.12, 0.12, 0.6]} />
        <meshStandardMaterial color="#444444" />
      </mesh>

      {/* Barrel */}
      <mesh position={[0, 0, -0.35]}>
        <cylinderGeometry args={[0.025, 0.025, 0.3, 8]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#222222" />
      </mesh>

      {/* Magazine */}
      <mesh ref={magazineRef} position={[0, -0.15, 0]}>
        <boxGeometry args={[0.1, 0.2, 0.08]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Stock */}
      <mesh position={[0, 0, 0.25]}>
        <boxGeometry args={[0.1, 0.08, 0.2]} />
        <meshStandardMaterial color="#555555" />
      </mesh>

      {/* Render attachments */}
      {weapon.attachments.sight && <SightAttachment type={weapon.attachments.sight.id} />}
      {weapon.attachments.barrel && <BarrelAttachment type={weapon.attachments.barrel.id} />}
      {weapon.attachments.underbarrel && <UnderbarrelAttachment type={weapon.attachments.underbarrel.id} />}
    </group>
  )
}

function PistolModel({ weapon, isReloading = false }: WeaponModelProps) {
  // Reference for slide animation
  const slideRef = useRef<any>(null)
  const magazineRef = useRef<any>(null)

  useFrame((_, delta) => {
    if (isReloading) {
      if (slideRef.current) {
        // Animate slide during reload
        slideRef.current.position.z = -0.05 + Math.sin(Date.now() * 0.01) * 0.05
      }

      if (magazineRef.current) {
        // Animate magazine dropping during reload
        magazineRef.current.position.y = -0.1 - Math.sin(Date.now() * 0.005) * 0.1
      }
    } else {
      if (slideRef.current) {
        // Reset slide position
        slideRef.current.position.z = 0
      }

      if (magazineRef.current) {
        // Reset magazine position
        magazineRef.current.position.y = -0.1
      }
    }
  })

  return (
    <group>
      {/* Main body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.08, 0.12, 0.2]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Slide */}
      <mesh ref={slideRef} position={[0, 0.02, -0.05]}>
        <boxGeometry args={[0.07, 0.04, 0.15]} />
        <meshStandardMaterial color="#222222" />
      </mesh>

      {/* Barrel */}
      <mesh position={[0, 0.02, -0.12]}>
        <cylinderGeometry args={[0.015, 0.015, 0.1, 8]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#222222" />
      </mesh>

      {/* Handle/Magazine */}
      <mesh ref={magazineRef} position={[0, -0.1, 0.05]}>
        <boxGeometry args={[0.06, 0.1, 0.1]} />
        <meshStandardMaterial color="#222222" />
      </mesh>

      {/* Render attachments */}
      {weapon.attachments.sight && <SightAttachment type={weapon.attachments.sight.id} />}
      {weapon.attachments.barrel && <BarrelAttachment type={weapon.attachments.barrel.id} />}
    </group>
  )
}

function KnifeModel() {
  // Reference for knife animation
  const knifeRef = useRef<any>(null)

  useFrame((_, delta) => {
    if (knifeRef.current) {
      // Subtle idle animation for knife
      knifeRef.current.rotation.z = Math.sin(Date.now() * 0.002) * 0.05
    }
  })

  return (
    <group ref={knifeRef}>
      {/* Blade */}
      <mesh position={[0, 0, -0.1]}>
        <boxGeometry args={[0.02, 0.08, 0.25]} />
        <meshStandardMaterial color="#CCCCCC" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Handle */}
      <mesh position={[0, 0, 0.08]}>
        <boxGeometry args={[0.03, 0.06, 0.15]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
    </group>
  )
}

function GrenadeModel() {
  // Reference for grenade animation
  const grenadeRef = useRef<any>(null)
  const pinRef = useRef<any>(null)

  useFrame((_, delta) => {
    if (grenadeRef.current) {
      // Subtle idle animation for grenade
      grenadeRef.current.rotation.y = Math.sin(Date.now() * 0.002) * 0.1
    }

    if (pinRef.current) {
      // Subtle idle animation for pin
      pinRef.current.rotation.z = Math.sin(Date.now() * 0.003) * 0.1
    }
  })

  return (
    <group ref={grenadeRef}>
      {/* Main body */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#556B2F" />
      </mesh>

      {/* Top */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.05, 8]} />
        <meshStandardMaterial color="#444444" />
      </mesh>

      {/* Pin */}
      <group ref={pinRef} position={[0, 0.1, 0]}>
        <mesh position={[0.03, 0, 0]}>
          <torusGeometry args={[0.015, 0.005, 8, 16]} />
          <meshStandardMaterial color="#CCCCCC" metalness={0.8} />
        </mesh>
      </group>
    </group>
  )
}

// Attachment models
function SightAttachment({ type }) {
  switch (type) {
    case "red_dot":
      return (
        <group position={[0, 0.08, 0]}>
          <mesh>
            <boxGeometry args={[0.06, 0.03, 0.06]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[0.01, 0.01, 0.01]} />
            <meshStandardMaterial color="#FF0000" emissive="#FF0000" emissiveIntensity={2} />
          </mesh>
        </group>
      )
    case "holographic":
      return (
        <group position={[0, 0.08, 0]}>
          <mesh>
            <boxGeometry args={[0.08, 0.04, 0.08]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
          <mesh position={[0, 0.025, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.01, 0.015, 16]} />
            <meshStandardMaterial color="#00FF00" emissive="#00FF00" emissiveIntensity={2} transparent opacity={0.7} />
          </mesh>
        </group>
      )
    case "acog":
      return (
        <group position={[0, 0.09, 0]}>
          <mesh>
            <boxGeometry args={[0.05, 0.05, 0.12]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
          <mesh position={[0, 0, 0.06]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.025, 0.02, 16]} />
            <meshStandardMaterial color="#444444" />
          </mesh>
          <mesh position={[0, 0, -0.06]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.02, 0.02, 16]} />
            <meshStandardMaterial color="#444444" />
          </mesh>
        </group>
      )
    default:
      return null
  }
}

function BarrelAttachment({ type }) {
  switch (type) {
    case "long_barrel":
      return (
        <mesh position={[0, 0, -0.45]}>
          <cylinderGeometry args={[0.02, 0.02, 0.2, 8]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      )
    case "suppressor":
      return (
        <group position={[0, 0, -0.45]}>
          <mesh>
            <cylinderGeometry args={[0.03, 0.03, 0.15, 8]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#222222" />
          </mesh>
          <mesh position={[0, 0\
