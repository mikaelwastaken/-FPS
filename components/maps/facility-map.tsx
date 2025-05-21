"use client"

import { useRef } from "react"
import { RigidBody, CuboidCollider } from "@react-three/rapier"
import type { Group } from "three"

export default function FacilityMap() {
  const mapRef = useRef<Group>(null)

  return (
    <group ref={mapRef}>
      {/* Ground */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[100, 0.1, 100]} position={[0, -0.1, 0]} />
        <mesh receiveShadow position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#444444" />
        </mesh>
      </RigidBody>

      {/* Main facility building */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh castShadow position={[0, 10, 0]}>
          <boxGeometry args={[60, 20, 60]} />
          <meshStandardMaterial color="#555555" />
        </mesh>
      </RigidBody>

      {/* Interior walls - create a maze-like structure */}
      <InteriorWalls />

      {/* Ceiling */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 20.1, 0]}>
          <boxGeometry args={[60, 0.2, 60]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      </RigidBody>

      {/* Floor */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[60, 0.2, 60]} />
          <meshStandardMaterial color="#666666" />
        </mesh>
      </RigidBody>

      {/* Entrances */}
      <Entrance position={[0, 0, 30]} rotation={[0, 0, 0]} />
      <Entrance position={[30, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
      <Entrance position={[0, 0, -30]} rotation={[0, Math.PI, 0]} />
      <Entrance position={[-30, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />

      {/* Skybox */}
      <mesh scale={[1, 1, 1]}>
        <sphereGeometry args={[500, 60, 40]} />
        <meshBasicMaterial color="#111111" side={1} />
      </mesh>
    </group>
  )
}

function InteriorWalls() {
  // Create a grid of walls to form corridors and rooms
  return (
    <group>
      {/* Main corridors */}
      <Wall position={[-15, 5, 0]} size={[1, 10, 50]} />
      <Wall position={[15, 5, 0]} size={[1, 10, 50]} />
      <Wall position={[0, 5, -15]} size={[30, 10, 1]} />
      <Wall position={[0, 5, 15]} size={[30, 10, 1]} />

      {/* Rooms */}
      {/* Room 1 */}
      <Wall position={[-25, 5, -25]} size={[10, 10, 1]} />
      <Wall position={[-25, 5, -20]} size={[1, 10, 10]} />

      {/* Room 2 */}
      <Wall position={[25, 5, -25]} size={[10, 10, 1]} />
      <Wall position={[25, 5, -20]} size={[1, 10, 10]} />

      {/* Room 3 */}
      <Wall position={[-25, 5, 25]} size={[10, 10, 1]} />
      <Wall position={[-25, 5, 20]} size={[1, 10, 10]} />

      {/* Room 4 */}
      <Wall position={[25, 5, 25]} size={[10, 10, 1]} />
      <Wall position={[25, 5, 20]} size={[1, 10, 10]} />

      {/* Central room */}
      <Wall position={[-5, 5, -5]} size={[10, 10, 1]} />
      <Wall position={[5, 5, -5]} size={[10, 10, 1]} />
      <Wall position={[-5, 5, 5]} size={[10, 10, 1]} />
      <Wall position={[5, 5, 5]} size={[10, 10, 1]} />
      <Wall position={[-5, 5, 0]} size={[1, 10, 10]} />
      <Wall position={[5, 5, 0]} size={[1, 10, 10]} />

      {/* Glass walls */}
      <GlassWall position={[0, 5, -10]} size={[10, 10, 0.2]} />
      <GlassWall position={[0, 5, 10]} size={[10, 10, 0.2]} />
      <GlassWall position={[-10, 5, 0]} size={[0.2, 10, 10]} />
      <GlassWall position={[10, 5, 0]} size={[0.2, 10, 10]} />
    </group>
  )
}

interface WallProps {
  position: [number, number, number]
  size: [number, number, number]
}

function Wall({ position, size }: WallProps) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={position}>
      <mesh castShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color="#777777" />
      </mesh>
    </RigidBody>
  )
}

function GlassWall({ position, size }: WallProps) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={position}>
      <mesh castShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color="#88CCFF" transparent opacity={0.3} />
      </mesh>
    </RigidBody>
  )
}

interface EntranceProps {
  position: [number, number, number]
  rotation: [number, number, number]
}

function Entrance({ position, rotation }: EntranceProps) {
  return (
    <group position={position} rotation={rotation}>
      {/* Entrance structure */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh castShadow position={[0, 5, 0]}>
          <boxGeometry args={[10, 10, 5]} />
          <meshStandardMaterial color="#555555" />
        </mesh>
      </RigidBody>

      {/* Door opening */}
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[4, 5, 6]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
    </group>
  )
}
