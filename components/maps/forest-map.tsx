"use client"

import React from "react"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { RigidBody, CuboidCollider } from "@react-three/rapier"
import type { Mesh, Group } from "three"

export default function ForestMap() {
  const mapRef = useRef<Group>(null)
  const treesRef = useRef<Mesh[]>([])

  useFrame(({ clock }) => {
    // Gentle wind effect for trees
    treesRef.current.forEach((tree, i) => {
      tree.rotation.z = Math.sin(clock.getElapsedTime() * 0.5 + i * 0.2) * 0.05
    })
  })

  return (
    <group ref={mapRef}>
      {/* Ground */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[100, 0.1, 100]} position={[0, -0.1, 0]} />
        <mesh receiveShadow position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#3a5f0b" />
        </mesh>
      </RigidBody>

      {/* Trees - generate a forest */}
      {Array.from({ length: 100 }).map((_, i) => {
        const x = Math.random() * 180 - 90
        const z = Math.random() * 180 - 90
        const height = 5 + Math.random() * 5
        const radius = 0.3 + Math.random() * 0.3

        // Don't place trees in the center area
        if (Math.abs(x) < 10 && Math.abs(z) < 10) return null

        return (
          <Tree
            key={i}
            position={[x, 0, z]}
            height={height}
            radius={radius}
            ref={(el) => el && (treesRef.current[i] = el)}
          />
        )
      })}

      {/* Rocks */}
      {Array.from({ length: 30 }).map((_, i) => {
        const x = Math.random() * 180 - 90
        const z = Math.random() * 180 - 90
        const scale = 0.5 + Math.random() * 2

        // Don't place rocks in the center area
        if (Math.abs(x) < 10 && Math.abs(z) < 10) return null

        return <Rock key={i} position={[x, 0, z]} scale={scale} />
      })}

      {/* Central clearing */}
      <mesh receiveShadow position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[10, 32]} />
        <meshStandardMaterial color="#5a7f2b" />
      </mesh>

      {/* Wooden cabin */}
      <Cabin position={[0, 0, 0]} />

      {/* Boundary */}
      <RigidBody type="fixed" position={[0, 1, -100]}>
        <mesh castShadow>
          <boxGeometry args={[200, 10, 1]} />
          <meshStandardMaterial color="#3a5f0b" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[0, 1, 100]}>
        <mesh castShadow>
          <boxGeometry args={[200, 10, 1]} />
          <meshStandardMaterial color="#3a5f0b" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[-100, 1, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1, 10, 200]} />
          <meshStandardMaterial color="#3a5f0b" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[100, 1, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1, 10, 200]} />
          <meshStandardMaterial color="#3a5f0b" />
        </mesh>
      </RigidBody>

      {/* Skybox */}
      <mesh scale={[1, 1, 1]}>
        <sphereGeometry args={[500, 60, 40]} />
        <meshBasicMaterial color="#87CEEB" side={1} />
      </mesh>
    </group>
  )
}

interface TreeProps {
  position: [number, number, number]
  height: number
  radius: number
}

const Tree = React.forwardRef<Mesh, TreeProps>(({ position, height, radius }, ref) => {
  return (
    <group position={position}>
      {/* Tree trunk */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh ref={ref} castShadow position={[0, height / 2, 0]}>
          <cylinderGeometry args={[radius, radius, height, 8]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      </RigidBody>

      {/* Tree foliage */}
      <mesh castShadow position={[0, height * 0.75, 0]}>
        <coneGeometry args={[height / 3, height, 8]} />
        <meshStandardMaterial color="#2e4b0a" />
      </mesh>
    </group>
  )
})

Tree.displayName = "Tree"

interface RockProps {
  position: [number, number, number]
  scale: number
}

function Rock({ position, scale }: RockProps) {
  return (
    <RigidBody type="fixed" position={[position[0], position[1] + scale / 2, position[2]]}>
      <mesh castShadow>
        <dodecahedronGeometry args={[scale, 0]} />
        <meshStandardMaterial color="#777777" />
      </mesh>
    </RigidBody>
  )
}

function Cabin({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Cabin base */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh castShadow position={[0, 2, 0]}>
          <boxGeometry args={[8, 4, 6]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      </RigidBody>

      {/* Roof */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh castShadow position={[0, 5, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[10, 2, 8]} />
          <meshStandardMaterial color="#5D4037" />
        </mesh>
      </RigidBody>

      {/* Door */}
      <mesh castShadow position={[0, 2, 3.01]}>
        <boxGeometry args={[1.5, 2.5, 0.1]} />
        <meshStandardMaterial color="#5D4037" />
      </mesh>

      {/* Windows */}
      <mesh castShadow position={[-2.5, 2.5, 3.01]}>
        <boxGeometry args={[1, 1, 0.1]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} />
      </mesh>
      <mesh castShadow position={[2.5, 2.5, 3.01]}>
        <boxGeometry args={[1, 1, 0.1]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} />
      </mesh>
    </group>
  )
}
