"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"
import LoadingScreen from "@/components/loading-screen"

// Dynamically import the game to avoid SSR issues with Three.js
const Game = dynamic(() => import("@/components/game"), {
  ssr: false,
  loading: () => <LoadingScreen />,
})

export default function HomePage() {
  return (
    <main className="w-full h-screen overflow-hidden bg-black">
      <Suspense fallback={<LoadingScreen />}>
        <Game />
      </Suspense>
    </main>
  )
}
