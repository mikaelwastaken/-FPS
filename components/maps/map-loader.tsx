"use client"

import { useState, useEffect } from "react"
import { useGameStore } from "@/lib/store"
import UrbanMap from "@/components/maps/urban-map"
import ForestMap from "@/components/maps/forest-map"
import FacilityMap from "@/components/maps/facility-map"

export default function MapLoader() {
  const { currentMap } = useGameStore()
  const [mapError, setMapError] = useState<string | null>(null)
  const [loadedMap, setLoadedMap] = useState<string | null>(null)

  // Reset error when map changes
  useEffect(() => {
    setMapError(null)
    setLoadedMap(currentMap)
  }, [currentMap])

  // Error boundary for map components
  const renderMapWithErrorHandling = () => {
    try {
      switch (currentMap) {
        case "urban":
          return <UrbanMap />
        case "forest":
          return <ForestMap />
        case "facility":
          return <FacilityMap />
        default:
          // Default to urban map if unknown map type
          console.warn(`Unknown map type: ${currentMap}, defaulting to urban`)
          return <UrbanMap />
      }
    } catch (error) {
      console.error(`Error loading map ${currentMap}:`, error)
      setMapError(
        `Failed to load ${currentMap} map. Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      )

      // Return a fallback simple map
      return (
        <group>
          {/* Simple ground */}
          <mesh receiveShadow position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[200, 200]} />
            <meshStandardMaterial color="#555555" />
          </mesh>

          {/* Simple skybox */}
          <mesh scale={[1, 1, 1]}>
            <sphereGeometry args={[500, 60, 40]} />
            <meshBasicMaterial color="#87CEEB" side={1} />
          </mesh>
        </group>
      )
    }
  }

  return (
    <>
      {mapError && (
        <group position={[0, 2, 0]}>
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="red" />
          </mesh>
        </group>
      )}
      {renderMapWithErrorHandling()}
    </>
  )
}
