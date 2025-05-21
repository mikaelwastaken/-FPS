import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"
import { persist } from "zustand/middleware"

export type GameState = "menu" | "playing" | "paused" | "gameOver"
export type MapType = "urban" | "forest" | "facility"
export type GameMode = "tdm" | "ffa" | "domination" | "ctf"
export type WeaponType =
  | "assaultRifle"
  | "submachineGun"
  | "shotgun"
  | "sniperRifle"
  | "lightMachineGun"
  | "pistol"
  | "knife"
  | "grenade"

export type WeaponSlot = "primary" | "secondary" | "melee" | "lethal"

export interface Attachment {
  id: string
  name: string
  type: "sight" | "barrel" | "underbarrel" | "magazine" | "stock" | "grip" | "muzzle"
  description: string
  stats: {
    damage?: number
    range?: number
    recoil?: number
    mobility?: number
    fireRate?: number
    reloadTime?: number
  }
  unlockLevel: number
  isUnlocked: boolean
  icon: string
}

export interface Weapon {
  id: string
  name: string
  type: WeaponType
  damage: number
  fireRate: number
  reloadTime: number
  maxAmmo: number
  currentAmmo: number
  reserveAmmo: number
  range: number
  recoil: number
  mobility: number
  isUnlocked: boolean
  model: string
  level: number
  xp: number
  xpToNextLevel: number
  maxLevel: number
  attachments: {
    sight: Attachment | null
    barrel: Attachment | null
    underbarrel: Attachment | null
    magazine: Attachment | null
    stock: Attachment | null
    grip: Attachment | null
    muzzle: Attachment | null
  }
  availableAttachments: Attachment[]
}

export interface KillStreak {
  id: string
  name: string
  description: string
  cost: number
  icon: string
  isUnlocked: boolean
  isActive: boolean
  duration: number // in seconds, 0 for instant effects
}

export interface Player {
  health: number
  maxHealth: number
  armor: number
  position: [number, number, number]
  rotation: [number, number, number]
  isMoving: boolean
  isRunning: boolean
  isCrouching: boolean
  isProne: boolean
  isSliding: boolean
  isJumping: boolean
  canJump: boolean
  weapons: {
    [key in WeaponSlot]: Weapon | null
  }
  activeWeaponSlot: WeaponSlot
  hasDualPrimaryPowerup: boolean
  level: number
  xp: number
  xpToNextLevel: number
  prestige: number
  killStreak: number
  availableKillStreaks: KillStreak[]
  activeKillStreaks: KillStreak[]
}

export interface Bot {
  id: string
  name: string
  health: number
  position: [number, number, number]
  rotation: [number, number, number]
  weapon: Weapon
  state: "idle" | "patrolling" | "chasing" | "attacking" | "dead"
  team: "allies" | "enemies"
}

export interface Settings {
  sensitivity: number
  fov: number
  brightness: number
  crosshair: {
    style: "default" | "dot" | "cross" | "circle"
    color: string
    size: number
    gap: number
    thickness: number
    opacity: number
    dot: boolean
  }
  audio: {
    master: number
    music: number
    effects: number
  }
  graphics: {
    quality: "low" | "medium" | "high" | "ultra"
    shadows: boolean
    antiAliasing: boolean
  }
  controls: {
    invertY: boolean
    autoReload: true
    toggleAim: boolean
    toggleCrouch: boolean
  }
}

export interface GameStore {
  gameState: GameState
  setGameState: (state: GameState) => void
  currentMap: MapType
  setCurrentMap: (map: MapType) => void
  gameMode: GameMode
  setGameMode: (mode: GameMode) => void
  player: Player
  updatePlayer: (updates: Partial<Player>) => void
  bots: Bot[]
  addBot: (bot: Bot) => void
  removeBot: (id: string) => void
  updateBot: (id: string, updates: Partial<Bot>) => void
  availableWeapons: Weapon[]
  equipWeapon: (weaponId: string, slot: WeaponSlot) => void
  switchWeapon: (slot: WeaponSlot) => void
  fireWeapon: () => void
  reloadWeapon: () => void
  throwGrenade: () => void
  addWeaponXP: (weaponSlot: WeaponSlot, xp: number) => void
  unlockAttachment: (weaponId: string, attachmentId: string) => void
  equipAttachment: (weaponSlot: WeaponSlot, attachmentId: string, attachmentType: Attachment["type"]) => void
  removeAttachment: (weaponSlot: WeaponType) => void
  addPlayerXP: (xp: number) => void
  incrementKillStreak: () => void
  resetKillStreak: () => void
  activateKillStreak: (killStreakId: string) => void
  deactivateKillStreak: (killStreakId: string) => void
  score: number
  addScore: (points: number) => void
  settings: Settings
  updateSettings: (updates: Partial<Settings>) => void
  resetGame: (clearStorage?: boolean) => void
  clearStorage: () => void
  storageCorrupted: boolean
  setStorageCorrupted: (value: boolean) => void
}

// Define attachments
const attachments: Attachment[] = [
  // Sights
  {
    id: "red_dot",
    name: "Red Dot Sight",
    type: "sight",
    description: "Improves target acquisition with a clear red dot.",
    stats: {
      mobility: -0.05,
    },
    unlockLevel: 2,
    isUnlocked: false,
    icon: "red_dot",
  },
  {
    id: "holographic",
    name: "Holographic Sight",
    type: "sight",
    description: "Provides a wider field of view than standard sights.",
    stats: {
      mobility: -0.08,
    },
    unlockLevel: 5,
    isUnlocked: false,
    icon: "holographic",
  },
  {
    id: "acog",
    name: "ACOG Scope",
    type: "sight",
    description: "4x magnification for medium to long range engagements.",
    stats: {
      mobility: -0.15,
      range: 0.2,
    },
    unlockLevel: 10,
    isUnlocked: false,
    icon: "acog",
  },

  // Barrels
  {
    id: "long_barrel",
    name: "Long Barrel",
    type: "barrel",
    description: "Increases effective range.",
    stats: {
      range: 0.2,
      mobility: -0.1,
    },
    unlockLevel: 4,
    isUnlocked: false,
    icon: "long_barrel",
  },
  {
    id: "suppressor",
    name: "Suppressor",
    type: "barrel",
    description: "Reduces sound and muzzle flash but decreases damage.",
    stats: {
      damage: -0.1,
      range: -0.1,
      recoil: -0.05,
    },
    unlockLevel: 7,
    isUnlocked: false,
    icon: "suppressor",
  },

  // Underbarrel
  {
    id: "foregrip",
    name: "Foregrip",
    type: "underbarrel",
    description: "Reduces recoil for better control.",
    stats: {
      recoil: -0.15,
    },
    unlockLevel: 3,
    isUnlocked: false,
    icon: "foregrip",
  },
  {
    id: "laser",
    name: "Laser Sight",
    type: "underbarrel",
    description: "Improves hip-fire accuracy.",
    stats: {
      recoil: -0.05,
    },
    unlockLevel: 6,
    isUnlocked: false,
    icon: "laser",
  },

  // Magazines
  {
    id: "extended_mag",
    name: "Extended Magazine",
    type: "magazine",
    description: "Increases ammo capacity.",
    stats: {
      mobility: -0.05,
    },
    unlockLevel: 4,
    isUnlocked: false,
    icon: "extended_mag",
  },
  {
    id: "fast_mag",
    name: "Fast Mag",
    type: "magazine",
    description: "Reduces reload time.",
    stats: {
      reloadTime: -0.2,
    },
    unlockLevel: 8,
    isUnlocked: false,
    icon: "fast_mag",
  },

  // Stocks
  {
    id: "lightweight_stock",
    name: "Lightweight Stock",
    type: "stock",
    description: "Increases movement speed while aiming.",
    stats: {
      mobility: 0.1,
      recoil: 0.05,
    },
    unlockLevel: 5,
    isUnlocked: false,
    icon: "lightweight_stock",
  },
  {
    id: "tactical_stock",
    name: "Tactical Stock",
    type: "stock",
    description: "Reduces recoil while aiming.",
    stats: {
      recoil: -0.1,
      mobility: -0.05,
    },
    unlockLevel: 9,
    isUnlocked: false,
    icon: "tactical_stock",
  },

  // Grips
  {
    id: "quickdraw_grip",
    name: "Quickdraw Grip",
    type: "grip",
    description: "Faster weapon draw and aim down sight speed.",
    stats: {
      mobility: 0.1,
    },
    unlockLevel: 3,
    isUnlocked: false,
    icon: "quickdraw_grip",
  },
  {
    id: "ergonomic_grip",
    name: "Ergonomic Grip",
    type: "grip",
    description: "Better handling and reduced recoil.",
    stats: {
      recoil: -0.08,
    },
    unlockLevel: 6,
    isUnlocked: false,
    icon: "ergonomic_grip",
  },

  // Muzzles
  {
    id: "muzzle_brake",
    name: "Muzzle Brake",
    type: "muzzle",
    description: "Reduces vertical recoil.",
    stats: {
      recoil: -0.1,
    },
    unlockLevel: 4,
    isUnlocked: false,
    icon: "muzzle_brake",
  },
  {
    id: "compensator",
    name: "Compensator",
    type: "muzzle",
    description: "Reduces horizontal recoil.",
    stats: {
      recoil: -0.12,
    },
    unlockLevel: 7,
    isUnlocked: false,
    icon: "compensator",
  },
]

// Define kill streaks
const killStreaks: KillStreak[] = [
  {
    id: "uav",
    name: "UAV Recon",
    description: "Reveals enemy positions on the minimap.",
    cost: 3,
    icon: "uav",
    isUnlocked: true,
    isActive: false,
    duration: 30,
  },
  {
    id: "counter_uav",
    name: "Counter UAV",
    description: "Jams enemy radar.",
    cost: 4,
    icon: "counter_uav",
    isUnlocked: true,
    isActive: false,
    duration: 30,
  },
  {
    id: "care_package",
    name: "Care Package",
    description: "Drops a random weapon or powerup.",
    cost: 5,
    icon: "care_package",
    isUnlocked: true,
    isActive: false,
    duration: 0,
  },
  {
    id: "sentry_gun",
    name: "Sentry Gun",
    description: "Automated turret that targets enemies.",
    cost: 7,
    icon: "sentry_gun",
    isUnlocked: true,
    isActive: false,
    duration: 60,
  },
  {
    id: "attack_helicopter",
    name: "Attack Helicopter",
    description: "Helicopter that patrols the map attacking enemies.",
    cost: 9,
    icon: "attack_helicopter",
    isUnlocked: true,
    isActive: false,
    duration: 45,
  },
  {
    id: "airstrike",
    name: "Precision Airstrike",
    description: "Call in an airstrike on a targeted location.",
    cost: 6,
    icon: "airstrike",
    isUnlocked: true,
    isActive: false,
    duration: 0,
  },
  {
    id: "juggernaut",
    name: "Juggernaut",
    description: "Don heavy armor with increased health and a minigun.",
    cost: 15,
    icon: "juggernaut",
    isUnlocked: true,
    isActive: false,
    duration: 120,
  },
]

// Define weapons with attachments
const createWeapon = (
  id: string,
  name: string,
  type: WeaponType,
  damage: number,
  fireRate: number,
  reloadTime: number,
  maxAmmo: number,
  range: number,
  recoil: number,
  mobility: number,
  isUnlocked: boolean,
  model: string,
): Weapon => {
  // Filter attachments that are applicable to this weapon type
  const weaponAttachments = attachments.filter((attachment) => {
    if (type === "knife" || type === "grenade") return false
    if (type === "pistol" && (attachment.type === "underbarrel" || attachment.type === "stock")) return false
    return true
  })

  return {
    id,
    name,
    type,
    damage,
    fireRate,
    reloadTime,
    maxAmmo,
    currentAmmo: maxAmmo,
    reserveAmmo: maxAmmo * 3,
    range,
    recoil,
    mobility,
    isUnlocked,
    model,
    level: 1,
    xp: 0,
    xpToNextLevel: 1000,
    maxLevel: 20,
    attachments: {
      sight: null,
      barrel: null,
      underbarrel: null,
      magazine: null,
      stock: null,
      grip: null,
      muzzle: null,
    },
    availableAttachments: weaponAttachments,
  }
}

const weapons: Weapon[] = [
  createWeapon("m4a1", "M4A1", "assaultRifle", 30, 700, 2.5, 30, 80, 0.3, 0.7, true, "m4a1"),
  createWeapon("ak47", "AK-47", "assaultRifle", 35, 600, 2.8, 30, 85, 0.4, 0.65, true, "ak47"),
  createWeapon("mp5", "MP5", "submachineGun", 25, 800, 2.2, 30, 60, 0.25, 0.8, true, "mp5"),
  createWeapon("p90", "P90", "submachineGun", 22, 900, 2.3, 50, 55, 0.2, 0.85, true, "p90"),
  createWeapon("r870", "R870 MCS", "shotgun", 80, 75, 0.7, 8, 20, 0.7, 0.6, true, "r870"),
  createWeapon("dsr50", "DSR-50", "sniperRifle", 95, 40, 3.5, 5, 100, 0.8, 0.4, true, "dsr50"),
  createWeapon("m8a1", "M8A1", "assaultRifle", 32, 750, 2.4, 32, 75, 0.35, 0.7, true, "m8a1"),
  createWeapon("lsat", "LSAT", "lightMachineGun", 33, 650, 4.5, 100, 85, 0.45, 0.5, true, "lsat"),
  createWeapon("msmc", "MSMC", "submachineGun", 28, 850, 2.1, 30, 50, 0.3, 0.8, true, "msmc"),
  createWeapon("m1911", "M1911", "pistol", 40, 400, 1.8, 8, 40, 0.25, 0.9, true, "m1911"),
  createWeapon("combatknife", "Combat Knife", "knife", 100, 100, 0, Number.POSITIVE_INFINITY, 2, 0, 1, true, "knife"),
  createWeapon("fraggrenade", "Frag Grenade", "grenade", 100, 0, 0, 2, 15, 0, 0.9, true, "fraggrenade"),
]

// Initial settings
const initialSettings: Settings = {
  sensitivity: 5,
  fov: 75,
  brightness: 50,
  crosshair: {
    style: "default",
    color: "#ffffff",
    size: 4,
    gap: 2,
    thickness: 1,
    opacity: 0.8,
    dot: true,
  },
  audio: {
    master: 80,
    music: 60,
    effects: 90,
  },
  graphics: {
    quality: "high",
    shadows: true,
    antiAliasing: true,
  },
  controls: {
    invertY: false,
    autoReload: true,
    toggleAim: false,
    toggleCrouch: false,
  },
}

// Initial player state
const initialPlayer: Player = {
  health: 100,
  maxHealth: 100,
  armor: 0,
  position: [0, 1.8, 0],
  rotation: [0, 0, 0],
  isMoving: false,
  isRunning: false,
  isCrouching: false,
  isProne: false,
  isSliding: false,
  isJumping: false,
  canJump: true,
  weapons: {
    primary: weapons.find((w) => w.id === "m4a1") || null,
    secondary: weapons.find((w) => w.id === "m1911") || null,
    melee: weapons.find((w) => w.id === "combatknife") || null,
    lethal: weapons.find((w) => w.id === "fraggrenade") || null,
  },
  activeWeaponSlot: "primary",
  hasDualPrimaryPowerup: false,
  level: 1,
  xp: 0,
  xpToNextLevel: 5000,
  prestige: 0,
  killStreak: 0,
  availableKillStreaks: killStreaks,
  activeKillStreaks: [],
}

// Create a deep clone of an object to avoid reference issues
function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item)) as unknown as T
  }

  const clonedObj = {} as T
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clonedObj[key] = deepClone(obj[key])
    }
  }

  return clonedObj
}

// Validate player object structure - now with more detailed logging and less strict validation
function validatePlayerObject(player: any): boolean {
  if (!player) {
    console.error("Player object is null or undefined")
    return false
  }

  // Check if player is an object
  if (typeof player !== "object") {
    console.error("Player is not an object:", typeof player)
    return false
  }

  // Instead of strict validation, let's just check if it has the minimal structure
  // we need to avoid crashes, and we'll fill in the rest with defaults
  const hasMinimalStructure = player.weapons !== undefined && player.activeWeaponSlot !== undefined

  if (!hasMinimalStructure) {
    console.error("Player object is missing minimal structure (weapons or activeWeaponSlot)")
    return false
  }

  return true
}

// Function to clear persisted state
function clearPersistedState() {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem("fps-game-storage")
      console.log("Cleared persisted game state")
      return true
    }
  } catch (error) {
    console.error("Failed to clear persisted state:", error)
  }
  return false
}

export const useGameStore = create<GameStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        gameState: "menu",
        setGameState: (state) => set({ gameState: state }),
        currentMap: "urban",
        setCurrentMap: (map) => set({ currentMap: map }),
        gameMode: "tdm",
        setGameMode: (mode) => set({ gameMode: mode }),
        player: deepClone(initialPlayer), // Use deep clone to avoid reference issues
        updatePlayer: (updates) =>
          set((state) => ({
            player: { ...state.player, ...updates },
          })),
        bots: [],
        addBot: (bot) =>
          set((state) => ({
            bots: [...state.bots, bot],
          })),
        removeBot: (id) =>
          set((state) => ({
            bots: state.bots.filter((bot) => bot.id !== id),
          })),
        updateBot: (id, updates) =>
          set((state) => ({
            bots: state.bots.map((bot) => (bot.id === id ? { ...bot, ...updates } : bot)),
          })),
        availableWeapons: weapons,
        equipWeapon: (weaponId, slot) =>
          set((state) => {
            const weapon = state.availableWeapons.find((w) => w.id === weaponId)
            if (!weapon) return state

            // Check if trying to equip a second primary when powerup is not active
            if (slot === "primary" && state.player.weapons.primary && !state.player.hasDualPrimaryPowerup) {
              return state
            }

            return {
              player: {
                ...state.player,
                weapons: {
                  ...state.player.weapons,
                  [slot]: { ...weapon },
                },
              },
            }
          }),
        switchWeapon: (slot) =>
          set((state) => {
            if (!state.player.weapons[slot]) return state
            return {
              player: {
                ...state.player,
                activeWeaponSlot: slot,
              },
            }
          }),
        fireWeapon: () =>
          set((state) => {
            const activeSlot = state.player.activeWeaponSlot
            const activeWeapon = state.player.weapons[activeSlot]

            if (!activeWeapon || activeWeapon.currentAmmo <= 0) return state

            return {
              player: {
                ...state.player,
                weapons: {
                  ...state.player.weapons,
                  [activeSlot]: {
                    ...activeWeapon,
                    currentAmmo: activeWeapon.currentAmmo - 1,
                  },
                },
              },
            }
          }),
        reloadWeapon: () =>
          set((state) => {
            const activeSlot = state.player.activeWeaponSlot
            const activeWeapon = state.player.weapons[activeSlot]

            if (!activeWeapon || activeWeapon.currentAmmo === activeWeapon.maxAmmo || activeWeapon.reserveAmmo <= 0) {
              return state
            }

            const ammoNeeded = activeWeapon.maxAmmo - activeWeapon.currentAmmo
            const ammoToAdd = Math.min(ammoNeeded, activeWeapon.reserveAmmo)

            return {
              player: {
                ...state.player,
                weapons: {
                  ...state.player.weapons,
                  [activeSlot]: {
                    ...activeWeapon,
                    currentAmmo: activeWeapon.currentAmmo + ammoToAdd,
                    reserveAmmo: activeWeapon.reserveAmmo - ammoToAdd,
                  },
                },
              },
            }
          }),
        throwGrenade: () =>
          set((state) => {
            const lethalWeapon = state.player.weapons.lethal

            if (!lethalWeapon || lethalWeapon.currentAmmo <= 0) return state

            return {
              player: {
                ...state.player,
                weapons: {
                  ...state.player.weapons,
                  lethal: {
                    ...lethalWeapon,
                    currentAmmo: lethalWeapon.currentAmmo - 1,
                  },
                },
              },
            }
          }),
        addWeaponXP: (weaponSlot, xp) =>
          set((state) => {
            const weapon = state.player.weapons[weaponSlot]
            if (!weapon) return state

            let newXP = weapon.xp + xp
            let newLevel = weapon.level
            let newXpToNextLevel = weapon.xpToNextLevel

            // Level up if enough XP
            while (newXP >= newXpToNextLevel && newLevel < weapon.maxLevel) {
              newXP -= newXpToNextLevel
              newLevel++
              newXpToNextLevel = Math.floor(newXpToNextLevel * 1.2) // Increase XP required for next level

              // Unlock attachments for this level
              weapon.availableAttachments.forEach((attachment) => {
                if (attachment.unlockLevel === newLevel) {
                  attachment.isUnlocked = true
                }
              })
            }

            // Cap XP at max level
            if (newLevel >= weapon.maxLevel) {
              newXP = 0
              newXpToNextLevel = 0
            }

            return {
              player: {
                ...state.player,
                weapons: {
                  ...state.player.weapons,
                  [weaponSlot]: {
                    ...weapon,
                    level: newLevel,
                    xp: newXP,
                    xpToNextLevel: newXpToNextLevel,
                  },
                },
              },
            }
          }),
        unlockAttachment: (weaponId, attachmentId) =>
          set((state) => {
            const updatedWeapons = state.availableWeapons.map((weapon) => {
              if (weapon.id === weaponId) {
                const updatedAttachments = weapon.availableAttachments.map((attachment) => {
                  if (attachment.id === attachmentId) {
                    return { ...attachment, isUnlocked: true }
                  }
                  return attachment
                })
                return { ...weapon, availableAttachments: updatedAttachments }
              }
              return weapon
            })

            return { availableWeapons: updatedWeapons }
          }),
        equipAttachment: (weaponSlot, attachmentId, attachmentType) =>
          set((state) => {
            const weapon = state.player.weapons[weaponSlot]
            if (!weapon) return state

            const attachment = weapon.availableAttachments.find((a) => a.id === attachmentId)
            if (!attachment || !attachment.isUnlocked) return state

            return {
              player: {
                ...state.player,
                weapons: {
                  ...state.player.weapons,
                  [weaponSlot]: {
                    ...weapon,
                    attachments: {
                      ...weapon.attachments,
                      [attachmentType]: attachment,
                    },
                  },
                },
              },
            }
          }),
        removeAttachment: (weaponSlot, attachmentType) =>
          set((state) => {
            const weapon = state.player.weapons[weaponSlot]
            if (!weapon) return state

            return {
              player: {
                ...state.player,
                weapons: {
                  ...state.player.weapons,
                  [weaponSlot]: {
                    ...weapon,
                    attachments: {
                      ...weapon.attachments,
                      [attachmentType]: null,
                    },
                  },
                },
              },
            }
          }),
        addPlayerXP: (xp) =>
          set((state) => {
            let newXP = state.player.xp + xp
            let newLevel = state.player.level
            let newXpToNextLevel = state.player.xpToNextLevel
            let newPrestige = state.player.prestige

            // Level up if enough XP
            while (newXP >= newXpToNextLevel) {
              newXP -= newXpToNextLevel
              newLevel++

              // Prestige at level 55
              if (newLevel > 55) {
                newLevel = 1
                newPrestige++
                newXP = 0
              }

              newXpToNextLevel = Math.floor(5000 * (1 + newLevel * 0.1))
            }

            return {
              player: {
                ...state.player,
                level: newLevel,
                xp: newXP,
                xpToNextLevel: newXpToNextLevel,
                prestige: newPrestige,
              },
            }
          }),
        incrementKillStreak: () =>
          set((state) => ({
            player: {
              ...state.player,
              killStreak: state.player.killStreak + 1,
            },
          })),
        resetKillStreak: () =>
          set((state) => ({
            player: {
              ...state.player,
              killStreak: 0,
            },
          })),
        activateKillStreak: (killStreakId) =>
          set((state) => {
            const killStreak = state.player.availableKillStreaks.find((ks) => ks.id === killStreakId)
            if (!killStreak || state.player.killStreak < killStreak.cost) return state

            // Activate the kill streak
            const updatedKillStreak = { ...killStreak, isActive: true }

            return {
              player: {
                ...state.player,
                killStreak: state.player.killStreak - killStreak.cost,
                activeKillStreaks: [...state.player.activeKillStreaks, updatedKillStreak],
              },
            }
          }),
        deactivateKillStreak: (killStreakId) =>
          set((state) => ({
            player: {
              ...state.player,
              activeKillStreaks: state.player.activeKillStreaks.filter((ks) => ks.id !== killStreakId),
            },
          })),
        score: 0,
        addScore: (points) =>
          set((state) => ({
            score: state.score + points,
          })),
        settings: initialSettings,
        updateSettings: (updates) =>
          set((state) => ({
            settings: { ...state.settings, ...updates },
          })),
        resetGame: (clearStorage = false) =>
          set((state) => {
            if (clearStorage) {
              clearPersistedState()
            }
            return {
              gameState: "menu",
              player: deepClone(initialPlayer),
              bots: [],
              score: 0,
              storageCorrupted: false,
            }
          }),
        clearStorage: () => {
          clearPersistedState()
          set({
            gameState: "menu",
            player: deepClone(initialPlayer),
            bots: [],
            score: 0,
            storageCorrupted: false,
          })
        },
        storageCorrupted: false,
        setStorageCorrupted: (value) => set({ storageCorrupted: value }),
      }),
      {
        name: "fps-game-storage",
        partialize: (state) => ({
          // Save all player progression data
          player: {
            level: state.player.level,
            xp: state.player.xp,
            xpToNextLevel: state.player.xpToNextLevel,
            prestige: state.player.prestige,
            weapons: state.player.weapons,
            availableKillStreaks: state.player.availableKillStreaks,
            // Add all other player properties to ensure complete state
            health: state.player.health,
            maxHealth: state.player.maxHealth,
            armor: state.player.armor,
            position: state.player.position,
            rotation: state.player.rotation,
            activeWeaponSlot: state.player.activeWeaponSlot,
            hasDualPrimaryPowerup: state.player.hasDualPrimaryPowerup,
            activeKillStreaks: state.player.activeKillStreaks,
            killStreak: state.player.killStreak,
            isMoving: state.player.isMoving,
            isRunning: state.player.isRunning,
            isCrouching: state.player.isCrouching,
            isProne: state.player.isProne,
            isSliding: state.player.isSliding,
            isJumping: state.player.isJumping,
            canJump: state.player.canJump,
          },
          // Save all weapon unlocks and progression
          availableWeapons: state.availableWeapons,
          // Save settings
          settings: state.settings,
          // Save current map selection
          currentMap: state.currentMap,
          // Save game mode
          gameMode: state.gameMode,
          // Save score
          score: state.score,
        }),
        // Add merge function to properly handle initial state
        merge: (persistedState: any, currentState) => {
          try {
            console.log("Merging persisted state")

            // Check if persistedState exists
            if (!persistedState) {
              console.warn("No persisted state found, using initial state")
              return {
                ...currentState,
                player: deepClone(initialPlayer),
                settings: deepClone(initialSettings),
              }
            }

            // Create a properly merged state with defaults for any missing values
            const mergedState = {
              ...currentState,
            }

            // Ensure player object is properly initialized with all required properties
            if (!persistedState.player || !validatePlayerObject(persistedState.player)) {
              console.warn("Invalid persisted player data, using initial player state")
              mergedState.player = deepClone(initialPlayer)
              mergedState.storageCorrupted = true
            } else {
              // Create a complete player object by merging with initialPlayer
              // This ensures all properties exist even if they're missing in persistedState
              mergedState.player = {
                ...deepClone(initialPlayer),
                ...persistedState.player,
              }

              // Ensure weapons object is complete
              if (!mergedState.player.weapons) {
                mergedState.player.weapons = deepClone(initialPlayer.weapons)
              } else {
                // Ensure each weapon slot has a value
                for (const slot of ["primary", "secondary", "melee", "lethal"] as WeaponSlot[]) {
                  if (!mergedState.player.weapons[slot]) {
                    mergedState.player.weapons[slot] = deepClone(initialPlayer.weapons[slot])
                  }
                }
              }

              // Ensure arrays are initialized
              if (!Array.isArray(mergedState.player.availableKillStreaks)) {
                mergedState.player.availableKillStreaks = deepClone(initialPlayer.availableKillStreaks)
              }

              if (!Array.isArray(mergedState.player.activeKillStreaks)) {
                mergedState.player.activeKillStreaks = []
              }

              // Ensure position and rotation are arrays
              if (!Array.isArray(mergedState.player.position) || mergedState.player.position.length !== 3) {
                mergedState.player.position = [0, 1.8, 0]
              }

              if (!Array.isArray(mergedState.player.rotation) || mergedState.player.rotation.length !== 3) {
                mergedState.player.rotation = [0, 0, 0]
              }
            }

            // Ensure settings are properly initialized
            mergedState.settings = {
              ...deepClone(initialSettings),
              ...(persistedState.settings || {}),
            }

            // Copy other persisted state properties
            if (persistedState.availableWeapons) mergedState.availableWeapons = persistedState.availableWeapons
            if (persistedState.currentMap) mergedState.currentMap = persistedState.currentMap
            if (persistedState.gameMode) mergedState.gameMode = persistedState.gameMode
            if (typeof persistedState.score === "number") mergedState.score = persistedState.score

            return mergedState
          } catch (error) {
            console.error("Error merging persisted state:", error)
            // If anything goes wrong, return a fresh state and mark storage as corrupted
            return {
              ...currentState,
              player: deepClone(initialPlayer),
              settings: deepClone(initialSettings),
              storageCorrupted: true,
            }
          }
        },
        // Ensure version is set to handle migrations if needed
        version: 1,
        // Add onRehydrateStorage to handle errors during rehydration
        onRehydrateStorage: () => (state) => {
          if (!state) {
            console.error("Failed to rehydrate state")
            return
          }

          if (!state.player || !validatePlayerObject(state.player)) {
            console.error("Invalid state after rehydration, marking storage as corrupted")
            state.setStorageCorrupted(true)
          }
        },
      },
    ),
  ),
)
