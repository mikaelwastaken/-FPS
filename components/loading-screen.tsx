import { Loader2 } from "lucide-react"

export default function LoadingScreen() {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-black text-white">
      <Loader2 className="h-12 w-12 animate-spin mb-4" />
      <h1 className="text-2xl font-bold">Loading Game...</h1>
      <p className="text-gray-400 mt-2">Preparing your weapons and maps</p>
    </div>
  )
}
