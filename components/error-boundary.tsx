"use client"

import React from "react"
import { useGameStore } from "@/lib/store"
import { AlertTriangle, RefreshCw } from "lucide-react"

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      lastErrorTime: 0,
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Update error count and time
    const now = Date.now()
    const errorCount = this.state.lastErrorTime > now - 5000 ? this.state.errorCount + 1 : 1

    this.setState({
      errorInfo,
      errorCount,
      lastErrorTime: now,
    })

    console.error("Game error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-black text-white p-4">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-4">Game Error</h1>
          <p className="text-gray-400 mb-6 text-center max-w-md">
            Something went wrong while running the game. This could be due to corrupted game data or a temporary issue.
          </p>

          {this.state.error && (
            <div className="mb-4 p-4 bg-red-900 bg-opacity-50 rounded max-w-lg overflow-auto w-full">
              <p className="font-mono text-sm overflow-auto max-h-20">{this.state.error.toString()}</p>
              {this.state.errorInfo && (
                <details className="mt-2">
                  <summary className="text-sm cursor-pointer">More details</summary>
                  <pre className="mt-2 text-xs overflow-auto max-h-40 bg-black bg-opacity-50 p-2 rounded">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          )}

          <div className="flex flex-col space-y-4 w-full max-w-md">
            <button
              className="px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center"
              onClick={() => {
                // Try to continue without resetting
                this.setState({ hasError: false, error: null, errorInfo: null })
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try to Continue
            </button>

            <button
              className="px-4 py-3 bg-red-600 text-white rounded hover:bg-red-700 flex items-center justify-center"
              onClick={() => {
                try {
                  const clearStorage = useGameStore.getState().clearStorage
                  clearStorage()
                  this.setState({ hasError: false, error: null, errorInfo: null })
                  window.location.reload()
                } catch (error) {
                  console.error("Error during reset:", error)
                  // If the reset fails, force a page reload
                  window.location.reload()
                }
              }}
            >
              Reset Game Data & Restart
            </button>

            <button
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 text-sm flex items-center justify-center"
              onClick={() => {
                localStorage.clear()
                window.location.reload()
              }}
            >
              Clear All Browser Storage & Restart
            </button>
          </div>

          <p className="text-gray-500 text-sm mt-6 text-center max-w-md">
            If this error persists, try clearing your browser cache or using the "Reset Game Data" button in the main
            menu.
          </p>
        </div>
      )
    }

    return this.props.children
  }
}
