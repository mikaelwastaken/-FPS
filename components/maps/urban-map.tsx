"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { RigidBody, CuboidCollider } from "@react-three/rapier"
import type { Mesh, Group } from "three"

export default function UrbanMap() {
  const mapRef = useRef<Group>(null)

  // Simulate glass breaking
  const glassRefs = useRef<Mesh[]>([])
  const brokenGlass = useRef<Set<number>>(new Set())

  useFrame(() => {
    // Map-specific animations or effects could go here
  })

  return (
    <group>
      {/* Ground */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[100, 0.1, 100]} position={[0, -0.1, 0]} />
        <mesh receiveShadow position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#555555" />
        </mesh>
      </RigidBody>

      {/* Buildings */}
      <Building position={[-15, 0, -15]} width={10} height={15} depth={10} />
      <Building position={[15, 0, -15]} width={10} height={10} depth={10} />
      <Building position={[-15, 0, 15]} width={10} height={12} depth={10} />
      <Building position={[15, 0, 15]} width={10} height={8} depth={10} />

      {/* Central building with glass */}
      <Building position={[0, 0, 0]} width={20} height={20} depth={20} hasGlass />

      {/* Roads */}
      <mesh receiveShadow position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 200]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh receiveShadow position={[0, 0.01, 0]} rotation={[-Math.PI / 2, Math.PI / 2, 0]}>
        <planeGeometry args={[10, 200]} />
        <meshStandardMaterial color="#333333" />
      </mesh>

      {/* Barriers */}
      <RigidBody type="fixed" position={[0, 1, -50]}>
        <mesh castShadow>
          <boxGeometry args={[100, 2, 1]} />
          <meshStandardMaterial color="#888888" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[0, 1, 50]}>
        <mesh castShadow>
          <boxGeometry args={[100, 2, 1]} />
          <meshStandardMaterial color="#888888" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[-50, 1, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1, 2, 100]} />
          <meshStandardMaterial color="#888888" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[50, 1, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1, 2, 100]} />
          <meshStandardMaterial color="#888888" />
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

interface BuildingProps {
  position: [number, number, number]
  width: number
  height: number
  depth: number
  hasGlass?: boolean
}

function Building({ position, width, height, depth, hasGlass = false }: BuildingProps) {
  return (
    <group position={position}>
      {/* Main building structure */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh castShadow position={[0, height / 2, 0]}>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial color="#CCCCCC" />
        </mesh>
      </RigidBody>

      {/* Glass windows if needed */}
      {hasGlass && (
        <>
          {/* Front glass */}
          <RigidBody type="fixed" colliders="cuboid">
            <mesh castShadow position={[0, height / 2, depth / 2 + 0.01]}>
              <boxGeometry args={[width - 2, height - 2, 0.1]} />
              <meshStandardMaterial color="#88CCFF" transparent opacity={0.3} />
            </mesh>
          </RigidBody>

          {/* Back glass */}
          <RigidBody type="fixed" colliders="cuboid">
            <mesh castShadow position={[0, height / 2, -depth / 2 - 0.01]}>
              <boxGeometry args={[width - 2, height - 2, 0.1]} />
              <meshStandardMaterial color="#88CCFF" transparent opacity={0.3} />
            </mesh>
          </RigidBody>

          {/* Left glass */}
          <RigidBody type="fixed" colliders="cuboid">
            <mesh castShadow position={[width / 2 + 0.01, height / 2, 0]}>
              <boxGeometry args={[0.1, height - 2, depth - 2]} />
              <meshStandardMaterial color="#88CCFF" transparent opacity={0.3} />
            </mesh>
          </RigidBody>

          {/* Right glass */}
          <RigidBody type="fixed" colliders="cuboid">
            <mesh castShadow position={[-width / 2 - 0.01, height / 2, 0]}>
              <boxGeometry args={[0.1, height - 2, depth - 2]} />
              <meshStandardMaterial color="#88CCFF" transparent opacity={0.3} />
            </mesh>
          </RigidBody>
        </>
      )}

      {/* Roof */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh castShadow position={[0, height + 0.1, 0]}>
          <boxGeometry args={[width, 0.2, depth]} />
          <meshStandardMaterial color="#555555" />
        </mesh>
      </RigidBody>
    </group>
  )
}
