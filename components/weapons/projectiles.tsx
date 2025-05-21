"use client"

import { useRef, useState, useImperativeHandle, forwardRef } from "react"
import { useFrame } from "@react-three/fiber"
import type { Vector3 } from "three"
import { useGameStore, type WeaponType } from "@/lib/store"

interface Projectile {
  id: number
  position: Vector3
  direction: Vector3
  type: WeaponType
  damage: number
  range: number
  distanceTraveled: number
  isActive: boolean
}

const Projectiles = forwardRef((props, ref) => {
  const [projectiles, setProjectiles] = useState<Projectile[]>([])
  const nextId = useRef(0)
  const { addScore } = useGameStore()

  // Expose methods to parent components
  useImperativeHandle(ref, () => ({
    createProjectile: (position: Vector3, direction: Vector3, type: WeaponType, damage: number, range: number) => {
      setProjectiles((prev) => [
        ...prev,
        {
          id: nextId.current++,
          position: position.clone(),
          direction: direction.clone(),
          type,
          damage,
          range,
          distanceTraveled: 0,
          isActive: true,
        },
      ])
    },
  }))

  useFrame(() => {
    setProjectiles((prev) =>
      prev
        .map((projectile) => {
          if (!projectile.isActive) return projectile

          // Calculate new position
          const speed = projectile.type === "grenade" ? 0.3 : 2
          const movement = projectile.direction.clone().multiplyScalar(speed)

          // Update position
          const newPosition = projectile.position.clone().add(movement)

          // Update distance traveled
          const distanceTraveled = projectile.distanceTraveled + movement.length()

          // Check if projectile has exceeded its range
          const isActive = distanceTraveled < projectile.range

          return {
            ...projectile,
            position: newPosition,
            distanceTraveled,
            isActive,
          }
        })
        .filter((projectile) => projectile.isActive || projectile.type === "grenade"),
    )
  })

  return (
    <group>
      {projectiles.map((projectile) => (
        <Bullet
          key={projectile.id}
          position={projectile.position}
          type={projectile.type}
          isActive={projectile.isActive}
        />
      ))}
    </group>
  )
})

Projectiles.displayName = "Projectiles"

interface BulletProps {
  position: Vector3
  type: WeaponType
  isActive: boolean
}

function Bullet({ position, type, isActive }: BulletProps) {
  if (type === "grenade" && !isActive) {
    // Render explosion
    return (
      <group position={position.toArray()}>
        <mesh>
          <sphereGeometry args={[2, 16, 16]} />
          <meshBasicMaterial color="#FF8C00" transparent opacity={0.7} />
        </mesh>
      </group>
    )
  }

  if (type === "grenade") {
    // Render grenade
    return (
      <group position={position.toArray()}>
        <mesh>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#556B2F" />
        </mesh>
      </group>
    )
  }

  // Render bullet
  return (
    <group position={position.toArray()}>
      <mesh>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshBasicMaterial color="#FFFF00" />
      </mesh>
    </group>
  )
}

export default Projectiles
