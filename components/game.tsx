"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { Physics } from "@react-three/rapier"
import { Suspense } from "react"
import { useGameStore } from "@/lib/store"
import MainMenu from "@/components/ui/main-menu"
import GameUI from "@/components/ui/game-ui"
import Player from "@/components/player"
import MapLoader from "@/components/maps/map-loader"
import WeaponSystem from "@/components/weapons/weapon-system"
import BotPlayers from "@/components/bots/bot-players"
import { Loader2 } from "lucide-react"
import SoundEffects from "@/components/sound-effects"
import { preloadCommonSounds } from "@/lib/sound-manager"

// Improve the validatePlayer function with more detailed checks
const validatePlayer = (player) => {
  if (!player) {
    console.error("Player object is null or undefined")
    return false
  }

  try {
    // Check essential properties - be more lenient
    return player.weapons !== undefined && player.activeWeaponSlot !== undefined
  } catch (error) {
    console.error("Error validating player in Game component:", error)
    return false
  }
}

// Enhance the error boundary component with more detailed error information
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    console.error("Game error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-black text-white">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="text-gray-400 mb-6">The game encountered an error and needs to restart.</p>

          {this.state.error && (
            <div className="mb-4 p-4 bg-red-900 bg-opacity-50 rounded max-w-lg overflow-auto">
              <p className="font-mono text-sm">{this.state.error.toString()}</p>
              {this.state.errorInfo && (
                <details className="mt-2">
                  <summary className="text-sm cursor-pointer">Stack trace</summary>
                  <pre className="mt-2 text-xs overflow-auto max-h-40">{this.state.errorInfo.componentStack}</pre>
                </details>
              )}
            </div>
          )}

          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => {
              const resetGame = useGameStore.getState().clearStorage
              resetGame()
              window.location.reload()
            }}
          >
            Reset Game Data & Restart
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default function Game() {
  const { gameState, setGameState, player, resetGame, clearStorage } = useGameStore()
  const [isLoaded, setIsLoaded] = useState(false)
  const [isPlayerDataReady, setIsPlayerDataReady] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [loadAttempts, setLoadAttempts] = useState(0)

  // Validate player data
  const validatePlayerData = () => validatePlayer(player)

  useEffect(() => {
    // Preload common sounds
    try {
      preloadCommonSounds()
    } catch (error) {
      console.error("Error preloading sounds:", error)
    }

    // Simulate loading assets
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Update the Game component to handle initialization errors better
  useEffect(() => {
    // Check if player data is properly loaded
    try {
      if (validatePlayerData()) {
        setIsPlayerDataReady(true)
      } else {
        console.error("Invalid player data, attempting recovery")
        setLoadAttempts((prev) => prev + 1)

        // Only reset after several attempts
        if (loadAttempts >= 2) {
          console.warn("Multiple load attempts failed, resetting game data")
          clearStorage()
          window.location.reload()
        }
      }
    } catch (error) {
      console.error("Error checking player data:", error)
      setHasError(true)
    }
  }, [player, setGameState, clearStorage, loadAttempts])

  // Handle errors
  if (hasError) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-black text-white">
        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
        <p className="text-gray-400 mb-6">The game encountered an initialization error and needs to restart.</p>
        <button
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          onClick={() => {
            clearStorage()
            window.location.reload()
          }}
        >
          Reset Game Data & Restart
        </button>
      </div>
    )
  }

  // Add a loading state check before rendering the game
  if (!isLoaded) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-black text-white">
        <Loader2 className="h-12 w-12 animate-spin mb-4" />
        <h1 className="text-2xl font-bold">Loading Assets...</h1>
        <p className="text-gray-400 mt-2">This may take a moment</p>
      </div>
    )
  }

  // Menu state doesn't require player data validation
  if (gameState === "menu") {
    return <MainMenu />
  }

  // For gameplay, ensure player data is valid
  if (gameState !== "menu" && !isPlayerDataReady) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-black text-white">
        <Loader2 className="h-12 w-12 animate-spin mb-4" />
        <h1 className="text-2xl font-bold">Initializing Player Data...</h1>
        <p className="text-gray-400 mt-2">This may take a moment</p>
        <button
          className="mt-8 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          onClick={() => {
            clearStorage()
            window.location.reload()
          }}
        >
          Reset Game Data
        </button>
      </div>
    )
  }

  // Wrap the game in an error boundary with more detailed error handling
  return (
    <ErrorBoundary>
      <Canvas shadows camera={{ fov: 75, near: 0.1, far: 1000 }}>
        <Suspense
          fallback={
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.5, 16, 16]} />
              <meshBasicMaterial color="#ffffff" wireframe />
            </mesh>
          }
        >
          <Physics gravity={[0, -9.81, 0]}>
            <ambientLight intensity={0.5} />
            <directionalLight
              position={[10, 10, 10]}
              intensity={1}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <MapLoader />
            <Player />
            <WeaponSystem />
            <BotPlayers />
            <SoundEffects />
          </Physics>
        </Suspense>
      </Canvas>
      <GameUI />
    </ErrorBoundary>
  )
}
