"use client"

import { useState, useEffect } from "react"
import { useGameStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Gamepad2, Settings, Users, Medal, Crosshair, Volume2, Monitor, AlertTriangle, RefreshCw } from "lucide-react"

export default function MainMenu() {
  const {
    setGameState,
    currentMap,
    setCurrentMap,
    setGameMode,
    settings,
    updateSettings,
    storageCorrupted,
    clearStorage,
  } = useGameStore()

  const [activeTab, setActiveTab] = useState("play")
  const [showSettings, setShowSettings] = useState(false)
  const [showCredits, setShowCredits] = useState(false)
  const [settingsTab, setSettingsTab] = useState("gameplay")
  const [showStorageError, setShowStorageError] = useState(false)
  const [showManualRepair, setShowManualRepair] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Check for storage corruption
  useEffect(() => {
    if (storageCorrupted) {
      setShowStorageError(true)
    }
  }, [storageCorrupted])

  const startGame = () => {
    setIsLoading(true)
    // Short delay to allow UI to update before starting the game
    setTimeout(() => {
      setGameState("playing")
    }, 100)
  }

  const handleRepairAndRestart = () => {
    clearStorage()
    window.location.reload()
  }

  // Map preview images
  const mapPreviews = {
    urban: "/images/urban-map-preview.jpg",
    forest: "/images/forest-map-preview.jpg",
    facility: "/images/facility-map-preview.jpg",
  }

  // Adding a manual repair option at the bottom of the Dialog UI
  const gameRepairDialog = (
    <Dialog open={showManualRepair} onOpenChange={setShowManualRepair}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-amber-500">
            <RefreshCw className="mr-2 h-5 w-5" />
            Game Repair Options
          </DialogTitle>
          <DialogDescription>
            If you're experiencing issues with the game not loading, try these repair options.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4">
          <Button variant="destructive" onClick={handleRepairAndRestart} className="flex items-center justify-center">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset Game Data & Restart
          </Button>
          <p className="text-sm text-gray-400">
            This will reset all game data including progress, settings, and loadouts. Use this option if the game won't
            start.
          </p>
          <div className="h-px bg-gray-700" />
          <Button
            variant="outline"
            onClick={() => {
              localStorage.clear()
              window.location.reload()
            }}
            className="flex items-center justify-center"
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Clear All Browser Storage
          </Button>
          <p className="text-sm text-gray-400">
            Last resort: This will clear all local storage for this website, including any other game data.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )

  // Add the new button to access repair options in the return statement
  // Inside the div with the play, loadout, progression, options buttons:
  const repairButton = (
    <div className="mt-2 text-center">
      <Button variant="outline" className="text-yellow-500" onClick={() => setShowManualRepair(true)}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Game Repair Options
      </Button>
    </div>
  )

  return (
    <div
      className="w-full h-screen flex flex-col items-center justify-center bg-black text-white"
      style={{
        backgroundImage: "url('/placeholder.svg?height=1080&width=1920')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: `brightness(${settings?.brightness ? settings.brightness / 50 : 1})`,
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-70" />

      <div className="relative z-10 w-full max-w-4xl p-6 rounded-lg bg-black bg-opacity-80 backdrop-blur-sm">
        <h1 className="text-5xl font-bold text-center mb-8">MODERN COMBAT</h1>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <RefreshCw className="h-12 w-12 animate-spin mb-4" />
            <h2 className="text-xl">Loading Game...</h2>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="play" className="text-lg py-3">
                <Gamepad2 className="mr-2 h-5 w-5" />
                Play
              </TabsTrigger>
              <TabsTrigger value="loadout" className="text-lg py-3">
                <Users className="mr-2 h-5 w-5" />
                Loadout
              </TabsTrigger>
              <TabsTrigger value="progression" className="text-lg py-3">
                <Medal className="mr-2 h-5 w-5" />
                Progression
              </TabsTrigger>
              <TabsTrigger value="options" className="text-lg py-3">
                <Settings className="mr-2 h-5 w-5" />
                Options
              </TabsTrigger>
            </TabsList>

            <TabsContent value="play" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className={`relative h-48 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                    currentMap === "urban" ? "border-primary" : "border-transparent hover:border-primary"
                  }`}
                  onClick={() => setCurrentMap("urban")}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10" />
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url('${mapPreviews.urban}')` }}
                  />
                  <div className="absolute bottom-0 left-0 p-4 z-20">
                    <h3 className="text-xl font-bold">Urban</h3>
                    <p className="text-sm text-gray-300">City combat with multiple buildings</p>
                  </div>
                </div>

                <div
                  className={`relative h-48 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                    currentMap === "forest" ? "border-primary" : "border-transparent hover:border-primary"
                  }`}
                  onClick={() => setCurrentMap("forest")}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10" />
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url('${mapPreviews.forest}')` }}
                  />
                  <div className="absolute bottom-0 left-0 p-4 z-20">
                    <h3 className="text-xl font-bold">Forest</h3>
                    <p className="text-sm text-gray-300">Dense woodland with natural cover</p>
                  </div>
                </div>

                <div
                  className={`relative h-48 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                    currentMap === "facility" ? "border-primary" : "border-transparent hover:border-primary"
                  }`}
                  onClick={() => setCurrentMap("facility")}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10" />
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url('${mapPreviews.facility}')` }}
                  />
                  <div className="absolute bottom-0 left-0 p-4 z-20">
                    <h3 className="text-xl font-bold">Facility</h3>
                    <p className="text-sm text-gray-300">Indoor complex with tight corridors</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Game Mode</h3>
                  <Select defaultValue="tdm" onValueChange={(value) => setGameMode(value as any)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tdm">Team Deathmatch</SelectItem>
                      <SelectItem value="ffa">Free For All</SelectItem>
                      <SelectItem value="domination">Domination</SelectItem>
                      <SelectItem value="ctf">Capture the Flag</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Player Count</h3>
                  <Select defaultValue="12">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select count" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="8">8 Players</SelectItem>
                      <SelectItem value="12">12 Players</SelectItem>
                      <SelectItem value="16">16 Players</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Difficulty</h3>
                  <Select defaultValue="normal">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button size="lg" className="w-full py-6 text-xl" onClick={startGame} disabled={isLoading}>
                {isLoading ? "LOADING..." : "START GAME"}
              </Button>

              {/* Add Reset Game Data button */}
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                  onClick={() => {
                    if (confirm("Are you sure you want to reset all game data? This cannot be undone.")) {
                      clearStorage()
                      window.location.reload()
                    }
                  }}
                >
                  Reset Game Data
                </Button>
              </div>

              {/* Add the repair button */}
              {repairButton}
            </TabsContent>

            <TabsContent value="loadout" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Primary Weapon</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {["M4A1", "AK-47", "MP5", "P90", "R870 MCS", "DSR-50", "M8A1", "LSAT"].map((weapon) => (
                      <div
                        key={weapon}
                        className="p-3 border rounded-md cursor-pointer hover:bg-gray-800 transition-colors"
                      >
                        <div className="h-20 bg-gray-700 rounded mb-2" />
                        <p className="font-medium">{weapon}</p>
                        <div className="mt-1 h-1 bg-gray-600 rounded-full">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: "60%" }} />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Level 8</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Secondary Weapon</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {["M1911", "Five-Seven", "B23R", "KAP-40"].map((weapon) => (
                      <div
                        key={weapon}
                        className="p-3 border rounded-md cursor-pointer hover:bg-gray-800 transition-colors"
                      >
                        <div className="h-20 bg-gray-700 rounded mb-2" />
                        <p className="font-medium">{weapon}</p>
                        <div className="mt-1 h-1 bg-gray-600 rounded-full">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: "40%" }} />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Level 5</p>
                      </div>
                    ))}
                  </div>

                  <h3 className="text-xl font-bold mt-6">Kill Streaks</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {["UAV Recon", "Counter UAV", "Care Package", "Airstrike", "Attack Helicopter", "Juggernaut"].map(
                      (streak, index) => (
                        <div
                          key={streak}
                          className="p-3 border rounded-md cursor-pointer hover:bg-gray-800 transition-colors"
                        >
                          <div className="h-12 w-12 bg-gray-700 rounded mx-auto mb-2" />
                          <p className="font-medium text-center text-sm">{streak}</p>
                          <p className="text-xs text-gray-400 text-center mt-1">{index + 3} Kills</p>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 border rounded-lg">
                <h3 className="text-xl font-bold mb-4">Weapon Customization</h3>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="h-24 w-48 bg-gray-700 rounded" />
                  <div>
                    <h4 className="text-lg font-medium">M4A1</h4>
                    <p className="text-sm text-gray-400">Level 8 - 3,450 / 5,000 XP</p>
                    <div className="mt-1 h-2 bg-gray-600 rounded-full w-48">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: "60%" }} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { name: "Red Dot Sight", type: "Sight", level: "Level 2" },
                    { name: "Suppressor", type: "Barrel", level: "Level 7" },
                    { name: "Foregrip", type: "Underbarrel", level: "Level 3" },
                    { name: "Extended Mag", type: "Magazine", level: "Level 4" },
                    { name: "Tactical Stock", type: "Stock", level: "Level 9" },
                    { name: "Quickdraw Grip", type: "Grip", level: "Level 3" },
                    { name: "Muzzle Brake", type: "Muzzle", level: "Level 4" },
                    { name: "Laser Sight", type: "Underbarrel", level: "Level 6" },
                  ].map((attachment) => (
                    <div
                      key={attachment.name}
                      className="p-2 border rounded-md cursor-pointer hover:bg-gray-800 transition-colors"
                    >
                      <div className="h-10 bg-gray-700 rounded mb-1" />
                      <p className="font-medium text-sm">{attachment.name}</p>
                      <p className="text-xs text-gray-400">
                        {attachment.type} - {attachment.level}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="progression" className="space-y-6">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold">Player Level</h3>
                    <div className="flex items-center mt-1">
                      <span className="text-3xl font-bold mr-2">24</span>
                      <div className="w-32 h-2 bg-gray-700 rounded-full">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: "70%" }} />
                      </div>
                      <span className="text-3xl font-bold ml-2">25</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">8,750 / 12,500 XP</p>
                  </div>
                  <div className="text-center">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center text-black font-bold text-2xl">
                      2
                    </div>
                    <p className="text-sm mt-1">Prestige</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-bold mb-2">Recent Unlocks</h4>
                    <div className="space-y-2">
                      {[
                        { name: "ACOG Scope", type: "Attachment", level: "Level 22" },
                        { name: "Attack Helicopter", type: "Kill Streak", level: "Level 23" },
                        { name: "P90", type: "Weapon", level: "Level 24" },
                      ].map((unlock) => (
                        <div key={unlock.name} className="flex items-center p-2 bg-gray-800 rounded">
                          <div className="h-10 w-10 bg-gray-700 rounded mr-3" />
                          <div>
                            <p className="font-medium">{unlock.name}</p>
                            <p className="text-xs text-gray-400">
                              {unlock.type} - {unlock.level}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold mb-2">Next Unlocks</h4>
                    <div className="space-y-2">
                      {[
                        { name: "Tactical Stock", type: "Attachment", level: "Level 25" },
                        { name: "Juggernaut", type: "Kill Streak", level: "Level 28" },
                        { name: "LSAT", type: "Weapon", level: "Level 30" },
                      ].map((unlock) => (
                        <div key={unlock.name} className="flex items-center p-2 bg-gray-800 rounded">
                          <div className="h-10 w-10 bg-gray-700 rounded mr-3" />
                          <div>
                            <p className="font-medium">{unlock.name}</p>
                            <p className="text-xs text-gray-400">
                              {unlock.type} - {unlock.level}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="text-xl font-bold mb-4">Weapon Progression</h3>
                <div className="space-y-3">
                  {[
                    { name: "M4A1", level: 8, progress: 60, maxLevel: 20 },
                    { name: "AK-47", level: 5, progress: 40, maxLevel: 20 },
                    { name: "MP5", level: 12, progress: 75, maxLevel: 20 },
                    { name: "DSR-50", level: 3, progress: 25, maxLevel: 20 },
                  ].map((weapon) => (
                    <div key={weapon.name} className="flex items-center">
                      <div className="h-12 w-12 bg-gray-700 rounded mr-3" />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium">{weapon.name}</p>
                          <p className="text-sm">
                            Level {weapon.level}/{weapon.maxLevel}
                          </p>
                        </div>
                        <div className="mt-1 h-2 bg-gray-700 rounded-full">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${weapon.progress}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="options" className="space-y-6">
              <Tabs value={settingsTab} onValueChange={setSettingsTab} className="w-full">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="gameplay" className="text-sm py-2">
                    <Gamepad2 className="mr-2 h-4 w-4" />
                    Gameplay
                  </TabsTrigger>
                  <TabsTrigger value="controls" className="text-sm py-2">
                    <Crosshair className="mr-2 h-4 w-4" />
                    Controls
                  </TabsTrigger>
                  <TabsTrigger value="audio" className="text-sm py-2">
                    <Volume2 className="mr-2 h-4 w-4" />
                    Audio
                  </TabsTrigger>
                  <TabsTrigger value="video" className="text-sm py-2">
                    <Monitor className="mr-2 h-4 w-4" />
                    Video
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="gameplay" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="auto-reload">Auto Reload</Label>
                        <Switch
                          id="auto-reload"
                          checked={settings.controls.autoReload}
                          onCheckedChange={(checked) =>
                            updateSettings({
                              controls: { ...settings.controls, autoReload: checked },
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="toggle-aim">Toggle Aim</Label>
                        <Switch
                          id="toggle-aim"
                          checked={settings.controls.toggleAim}
                          onCheckedChange={(checked) =>
                            updateSettings({
                              controls: { ...settings.controls, toggleAim: checked },
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="toggle-crouch">Toggle Crouch</Label>
                        <Switch
                          id="toggle-crouch"
                          checked={settings.controls.toggleCrouch}
                          onCheckedChange={(checked) =>
                            updateSettings({
                              controls: { ...settings.controls, toggleCrouch: checked },
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="controls" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="sensitivity">Mouse Sensitivity</Label>
                        <div className="flex items-center mt-2">
                          <span className="mr-2 text-sm">1</span>
                          <Slider
                            id="sensitivity"
                            min={1}
                            max={10}
                            step={0.1}
                            value={[settings.sensitivity]}
                            onValueChange={([value]) => updateSettings({ sensitivity: value })}
                            className="flex-1"
                          />
                          <span className="ml-2 text-sm">10</span>
                        </div>
                        <div className="text-center mt-1 text-sm">{settings.sensitivity.toFixed(1)}</div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="invert-y">Invert Y-Axis</Label>
                        <Switch
                          id="invert-y"
                          checked={settings.controls.invertY}
                          onCheckedChange={(checked) =>
                            updateSettings({
                              controls: { ...settings.controls, invertY: checked },
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="fov">Field of View (FOV)</Label>
                        <div className="flex items-center mt-2">
                          <span className="mr-2 text-sm">60</span>
                          <Slider
                            id="fov"
                            min={60}
                            max={120}
                            step={1}
                            value={[settings.fov]}
                            onValueChange={([value]) => updateSettings({ fov: value })}
                            className="flex-1"
                          />
                          <span className="ml-2 text-sm">120</span>
                        </div>
                        <div className="text-center mt-1 text-sm">{settings.fov}°</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-bold mb-3">Crosshair Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="crosshair-style">Crosshair Style</Label>
                          <Select
                            value={settings.crosshair.style}
                            onValueChange={(value) =>
                              updateSettings({
                                crosshair: { ...settings.crosshair, style: value as any },
                              })
                            }
                          >
                            <SelectTrigger id="crosshair-style" className="mt-1">
                              <SelectValue placeholder="Select style" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="default">Default</SelectItem>
                              <SelectItem value="dot">Dot</SelectItem>
                              <SelectItem value="cross">Cross</SelectItem>
                              <SelectItem value="circle">Circle</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="crosshair-color">Crosshair Color</Label>
                          <div className="flex mt-1">
                            <Input
                              id="crosshair-color"
                              type="color"
                              value={settings.crosshair.color}
                              onChange={(e) =>
                                updateSettings({
                                  crosshair: { ...settings.crosshair, color: e.target.value },
                                })
                              }
                              className="w-12 h-8 p-0 mr-2"
                            />
                            <Input
                              value={settings.crosshair.color}
                              onChange={(e) =>
                                updateSettings({
                                  crosshair: { ...settings.crosshair, color: e.target.value },
                                })
                              }
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="crosshair-size">Crosshair Size</Label>
                          <div className="flex items-center mt-2">
                            <span className="mr-2 text-sm">1</span>
                            <Slider
                              id="crosshair-size"
                              min={1}
                              max={10}
                              step={1}
                              value={[settings.crosshair.size]}
                              onValueChange={([value]) =>
                                updateSettings({
                                  crosshair: { ...settings.crosshair, size: value },
                                })
                              }
                              className="flex-1"
                            />
                            <span className="ml-2 text-sm">10</span>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="crosshair-opacity">Crosshair Opacity</Label>
                          <div className="flex items-center mt-2">
                            <span className="mr-2 text-sm">0.1</span>
                            <Slider
                              id="crosshair-opacity"
                              min={0.1}
                              max={1}
                              step={0.1}
                              value={[settings.crosshair.opacity]}
                              onValueChange={([value]) =>
                                updateSettings({
                                  crosshair: { ...settings.crosshair, opacity: value },
                                })
                              }
                              className="flex-1"
                            />
                            <span className="ml-2 text-sm">1.0</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="crosshair-dot">Center Dot</Label>
                          <Switch
                            id="crosshair-dot"
                            checked={settings.crosshair.dot}
                            onCheckedChange={(checked) =>
                              updateSettings({
                                crosshair: { ...settings.crosshair, dot: checked },
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-center">
                      <div
                        className="w-32 h-32 border border-gray-600 rounded flex items-center justify-center bg-gray-900"
                        style={{ position: "relative" }}
                      >
                        {/* Crosshair preview */}
                        {settings.crosshair.style === "default" && (
                          <div className="relative">
                            <div
                              style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                width: `${settings.crosshair.thickness}px`,
                                height: `${settings.crosshair.size * 2}px`,
                                backgroundColor: settings.crosshair.color,
                                transform: "translate(-50%, -50%)",
                                opacity: settings.crosshair.opacity,
                              }}
                            ></div>
                            <div
                              style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                width: `${settings.crosshair.size * 2}px`,
                                height: `${settings.crosshair.thickness}px`,
                                backgroundColor: settings.crosshair.color,
                                transform: "translate(-50%, -50%)",
                                opacity: settings.crosshair.opacity,
                              }}
                            ></div>
                            {settings.crosshair.dot && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: "50%",
                                  left: "50%",
                                  width: "2px",
                                  height: "2px",
                                  backgroundColor: settings.crosshair.color,
                                  transform: "translate(-50%, -50%)",
                                  opacity: settings.crosshair.opacity,
                                }}
                              ></div>
                            )}
                          </div>
                        )}

                        {settings.crosshair.style === "dot" && (
                          <div
                            style={{
                              width: `${settings.crosshair.size * 2}px`,
                              height: `${settings.crosshair.size * 2}px`,
                              backgroundColor: settings.crosshair.color,
                              borderRadius: "50%",
                              transform: "translate(-50%, -50%)",
                              opacity: settings.crosshair.opacity,
                            }}
                          ></div>
                        )}

                        {settings.crosshair.style === "cross" && (
                          <div className="relative">
                            <div
                              style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                width: `${settings.crosshair.thickness}px`,
                                height: `${settings.crosshair.size * 2}px`,
                                backgroundColor: settings.crosshair.color,
                                transform: "translate(-50%, -50%)",
                                opacity: settings.crosshair.opacity,
                              }}
                            ></div>
                            <div
                              style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                width: `${settings.crosshair.size * 2}px`,
                                height: `${settings.crosshair.thickness}px`,
                                backgroundColor: settings.crosshair.color,
                                transform: "translate(-50%, -50%)",
                                opacity: settings.crosshair.opacity,
                              }}
                            ></div>
                          </div>
                        )}

                        {settings.crosshair.style === "circle" && (
                          <div
                            style={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              width: `${settings.crosshair.size * 2}px`,
                              height: `${settings.crosshair.size * 2}px`,
                              border: `${settings.crosshair.thickness}px solid ${settings.crosshair.color}`,
                              borderRadius: "50%",
                              transform: "translate(-50%, -50%)",
                              opacity: settings.crosshair.opacity,
                            }}
                          >
                            {settings.crosshair.dot && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: "50%",
                                  left: "50%",
                                  width: "2px",
                                  height: "2px",
                                  backgroundColor: settings.crosshair.color,
                                  transform: "translate(-50%, -50%)",
                                }}
                              ></div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="audio" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="master-volume">Master Volume</Label>
                      <div className="flex items-center mt-2">
                        <span className="mr-2 text-sm">0</span>
                        <Slider
                          id="master-volume"
                          min={0}
                          max={100}
                          step={1}
                          value={[settings.audio.master]}
                          onValueChange={([value]) =>
                            updateSettings({
                              audio: { ...settings.audio, master: value },
                            })
                          }
                          className="flex-1"
                        />
                        <span className="ml-2 text-sm">100</span>
                      </div>
                      <div className="text-center mt-1 text-sm">{settings.audio.master}%</div>
                    </div>

                    <div>
                      <Label htmlFor="music-volume">Music Volume</Label>
                      <div className="flex items-center mt-2">
                        <span className="mr-2 text-sm">0</span>
                        <Slider
                          id="music-volume"
                          min={0}
                          max={100}
                          step={1}
                          value={[settings.audio.music]}
                          onValueChange={([value]) =>
                            updateSettings({
                              audio: { ...settings.audio, music: value },
                            })
                          }
                          className="flex-1"
                        />
                        <span className="ml-2 text-sm">100</span>
                      </div>
                      <div className="text-center mt-1 text-sm">{settings.audio.music}%</div>
                    </div>

                    <div>
                      <Label htmlFor="effects-volume">Effects Volume</Label>
                      <div className="flex items-center mt-2">
                        <span className="mr-2 text-sm">0</span>
                        <Slider
                          id="effects-volume"
                          min={0}
                          max={100}
                          step={1}
                          value={[settings.audio.effects]}
                          onValueChange={([value]) =>
                            updateSettings({
                              audio: { ...settings.audio, effects: value },
                            })
                          }
                          className="flex-1"
                        />
                        <span className="ml-2 text-sm">100</span>
                      </div>
                      <div className="text-center mt-1 text-sm">{settings.audio.effects}%</div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="video" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="brightness">Brightness</Label>
                        <div className="flex items-center mt-2">
                          <span className="mr-2 text-sm">0</span>
                          <Slider
                            id="brightness"
                            min={10}
                            max={100}
                            step={1}
                            value={[settings.brightness]}
                            onValueChange={([value]) => updateSettings({ brightness: value })}
                            className="flex-1"
                          />
                          <span className="ml-2 text-sm">100</span>
                        </div>
                        <div className="text-center mt-1 text-sm">{settings.brightness}%</div>
                      </div>

                      <div>
                        <Label htmlFor="quality">Graphics Quality</Label>
                        <Select
                          value={settings.graphics.quality}
                          onValueChange={(value) =>
                            updateSettings({
                              graphics: { ...settings.graphics, quality: value as any },
                            })
                          }
                        >
                          <SelectTrigger id="quality" className="mt-1">
                            <SelectValue placeholder="Select quality" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="ultra">Ultra</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="shadows">Shadows</Label>
                        <Switch
                          id="shadows"
                          checked={settings.graphics.shadows}
                          onCheckedChange={(checked) =>
                            updateSettings({
                              graphics: { ...settings.graphics, shadows: checked },
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="anti-aliasing">Anti-Aliasing</Label>
                        <Switch
                          id="anti-aliasing"
                          checked={settings.graphics.antiAliasing}
                          onCheckedChange={(checked) =>
                            updateSettings({
                              graphics: { ...settings.graphics, antiAliasing: checked },
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        )}
      </div>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Advanced Settings</DialogTitle>
            <DialogDescription>Configure detailed game settings</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-medium">Gameplay</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Auto-reload</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>
                <div className="flex justify-between">
                  <span>Aim assist</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>
                <div className="flex justify-between">
                  <span>Show hit markers</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-medium">Graphics</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Shadows</span>
                  <Select defaultValue="high">
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="off">Off</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-between">
                  <span>Anti-aliasing</span>
                  <Select defaultValue="fxaa">
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="off">Off</SelectItem>
                      <SelectItem value="fxaa">FXAA</SelectItem>
                      <SelectItem value="smaa">SMAA</SelectItem>
                      <SelectItem value="msaa">MSAA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCredits} onOpenChange={setShowCredits}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Credits</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Modern Combat FPS Game</p>
            <p>Created with React Three Fiber</p>
            <p>© 2025 Game Studio</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Storage corruption dialog */}
      <Dialog open={showStorageError} onOpenChange={setShowStorageError}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-amber-500">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Storage Error Detected
            </DialogTitle>
            <DialogDescription>
              We detected an issue with your saved game data. Your progress has been reset to prevent further issues.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-3">
            <p className="text-sm text-gray-400">
              This can happen due to browser updates, clearing cache, or data corruption. Your game has been reset to a
              fresh state.
            </p>
            <Button
              onClick={() => {
                setShowStorageError(false)
              }}
            >
              I Understand
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Game repair dialog */}
      {gameRepairDialog}
    </div>
  )
}
