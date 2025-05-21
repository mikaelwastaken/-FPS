// Sound manager for handling all game audio
import { create } from "zustand"

// Define sound categories
export type SoundCategory = "weapon" | "player" | "environment" | "ui" | "music"

// Define sound types
export type WeaponSoundType = "fire" | "reload_start" | "reload_mid" | "reload_end" | "empty" | "switch"

export type PlayerSoundType =
  | "footstep_concrete"
  | "footstep_grass"
  | "footstep_metal"
  | "jump"
  | "land"
  | "crouch"
  | "prone"
  | "run"
  | "hit"
  | "death"

export type EnvironmentSoundType =
  | "wind"
  | "rain"
  | "thunder"
  | "urban_ambient"
  | "forest_ambient"
  | "facility_ambient"
  | "explosion_distant"

export type UISoundType = "click" | "hover" | "level_up" | "weapon_unlock" | "kill_confirmed"

export type MusicSoundType = "menu" | "game_start" | "combat" | "victory" | "defeat"

// Define sound file paths
const soundPaths = {
  weapon: {
    // Assault Rifle sounds
    m4a1_fire: "/sounds/weapons/m4a1_fire.mp3",
    m4a1_reload_start: "/sounds/weapons/m4a1_reload_start.mp3",
    m4a1_reload_mid: "/sounds/weapons/m4a1_reload_mid.mp3",
    m4a1_reload_end: "/sounds/weapons/m4a1_reload_end.mp3",

    // AK-47 sounds
    ak47_fire: "/sounds/weapons/ak47_fire.mp3",
    ak47_reload_start: "/sounds/weapons/ak47_reload_start.mp3",
    ak47_reload_mid: "/sounds/weapons/ak47_reload_mid.mp3",
    ak47_reload_end: "/sounds/weapons/ak47_reload_end.mp3",

    // SMG sounds
    mp5_fire: "/sounds/weapons/mp5_fire.mp3",
    mp5_reload_start: "/sounds/weapons/mp5_reload_start.mp3",
    mp5_reload_mid: "/sounds/weapons/mp5_reload_mid.mp3",
    mp5_reload_end: "/sounds/weapons/mp5_reload_end.mp3",

    // Shotgun sounds
    shotgun_fire: "/sounds/weapons/shotgun_fire.mp3",
    shotgun_reload_start: "/sounds/weapons/shotgun_reload_start.mp3",
    shotgun_reload_mid: "/sounds/weapons/shotgun_reload_mid.mp3",
    shotgun_reload_end: "/sounds/weapons/shotgun_reload_end.mp3",

    // Sniper sounds
    sniper_fire: "/sounds/weapons/sniper_fire.mp3",
    sniper_reload_start: "/sounds/weapons/sniper_reload_start.mp3",
    sniper_reload_mid: "/sounds/weapons/sniper_reload_mid.mp3",
    sniper_reload_end: "/sounds/weapons/sniper_reload_end.mp3",

    // Pistol sounds
    pistol_fire: "/sounds/weapons/pistol_fire.mp3",
    pistol_reload_start: "/sounds/weapons/pistol_reload_start.mp3",
    pistol_reload_mid: "/sounds/weapons/pistol_reload_mid.mp3",
    pistol_reload_end: "/sounds/weapons/pistol_reload_end.mp3",

    // Common weapon sounds
    weapon_switch: "/sounds/weapons/weapon_switch.mp3",
    weapon_empty: "/sounds/weapons/weapon_empty.mp3",

    // Melee sounds
    knife_swing: "/sounds/weapons/knife_swing.mp3",
    knife_hit: "/sounds/weapons/knife_hit.mp3",

    // Grenade sounds
    grenade_throw: "/sounds/weapons/grenade_throw.mp3",
    grenade_pin: "/sounds/weapons/grenade_pin.mp3",
    grenade_explosion: "/sounds/weapons/grenade_explosion.mp3",
  },

  player: {
    // Footstep sounds
    footstep_concrete_1: "/sounds/player/footstep_concrete_1.mp3",
    footstep_concrete_2: "/sounds/player/footstep_concrete_2.mp3",
    footstep_concrete_3: "/sounds/player/footstep_concrete_3.mp3",
    footstep_concrete_4: "/sounds/player/footstep_concrete_4.mp3",

    footstep_grass_1: "/sounds/player/footstep_grass_1.mp3",
    footstep_grass_2: "/sounds/player/footstep_grass_2.mp3",
    footstep_grass_3: "/sounds/player/footstep_grass_3.mp3",
    footstep_grass_4: "/sounds/player/footstep_grass_4.mp3",

    footstep_metal_1: "/sounds/player/footstep_metal_1.mp3",
    footstep_metal_2: "/sounds/player/footstep_metal_2.mp3",
    footstep_metal_3: "/sounds/player/footstep_metal_3.mp3",
    footstep_metal_4: "/sounds/player/footstep_metal_4.mp3",

    // Movement sounds
    jump: "/sounds/player/jump.mp3",
    land: "/sounds/player/land.mp3",
    crouch_down: "/sounds/player/crouch_down.mp3",
    crouch_up: "/sounds/player/crouch_up.mp3",
    prone_down: "/sounds/player/prone_down.mp3",
    prone_up: "/sounds/player/prone_up.mp3",

    // Player state sounds
    hit_1: "/sounds/player/hit_1.mp3",
    hit_2: "/sounds/player/hit_2.mp3",
    death_1: "/sounds/player/death_1.mp3",
    death_2: "/sounds/player/death_2.mp3",
  },

  environment: {
    // Ambient sounds
    urban_ambient: "/sounds/environment/urban_ambient.mp3",
    forest_ambient: "/sounds/environment/forest_ambient.mp3",
    facility_ambient: "/sounds/environment/facility_ambient.mp3",

    // Weather sounds
    wind_light: "/sounds/environment/wind_light.mp3",
    wind_strong: "/sounds/environment/wind_strong.mp3",
    rain_light: "/sounds/environment/rain_light.mp3",
    rain_heavy: "/sounds/environment/rain_heavy.mp3",
    thunder_1: "/sounds/environment/thunder_1.mp3",
    thunder_2: "/sounds/environment/thunder_2.mp3",

    // Distant sounds
    explosion_distant_1: "/sounds/environment/explosion_distant_1.mp3",
    explosion_distant_2: "/sounds/environment/explosion_distant_2.mp3",
    gunfire_distant: "/sounds/environment/gunfire_distant.mp3",
  },

  ui: {
    ui_click: "/sounds/ui/ui_click.mp3",
    ui_hover: "/sounds/ui/ui_hover.mp3",
    level_up: "/sounds/ui/level_up.mp3",
    weapon_unlock: "/sounds/ui/weapon_unlock.mp3",
    kill_confirmed: "/sounds/ui/kill_confirmed.mp3",
    game_start: "/sounds/ui/game_start.mp3",
    game_end: "/sounds/ui/game_end.mp3",
  },

  music: {
    menu_music: "/sounds/music/menu_music.mp3",
    game_start_music: "/sounds/music/game_start_music.mp3",
    combat_music: "/sounds/music/combat_music.mp3",
    victory_music: "/sounds/music/victory_music.mp3",
    defeat_music: "/sounds/music/defeat_music.mp3",
  },
}

// Audio cache to prevent reloading sounds
const audioCache: Map<string, HTMLAudioElement> = new Map()

// Sound manager store
interface SoundStore {
  masterVolume: number
  categoryVolumes: Record<SoundCategory, number>
  muted: boolean
  currentMusic: string | null
  musicLoop: boolean
  setMasterVolume: (volume: number) => void
  setCategoryVolume: (category: SoundCategory, volume: number) => void
  setMuted: (muted: boolean) => void
  playSound: (category: SoundCategory, soundId: string, options?: PlaySoundOptions) => void
  stopSound: (soundId: string) => void
  playMusic: (musicId: string, loop?: boolean) => void
  stopMusic: () => void
  getWeaponSound: (weaponType: string, soundType: WeaponSoundType) => string
}

interface PlaySoundOptions {
  volume?: number
  loop?: boolean
  position?: [number, number, number]
  pitch?: number
}

export const useSoundStore = create<SoundStore>((set, get) => ({
  masterVolume: 0.8,
  categoryVolumes: {
    weapon: 0.9,
    player: 0.8,
    environment: 0.7,
    ui: 0.6,
    music: 0.5,
  },
  muted: false,
  currentMusic: null,
  musicLoop: false,

  setMasterVolume: (volume) => set({ masterVolume: volume }),

  setCategoryVolume: (category, volume) =>
    set((state) => ({
      categoryVolumes: {
        ...state.categoryVolumes,
        [category]: volume,
      },
    })),

  setMuted: (muted) => set({ muted }),

  playSound: (category, soundId, options = {}) => {
    const { masterVolume, categoryVolumes, muted } = get()

    if (muted) return

    // Get the full path for the sound
    const soundPath = soundPaths[category]?.[soundId]
    if (!soundPath) {
      console.warn(`Sound not found: ${category}/${soundId}`)
      return
    }

    // Check if the sound is already cached
    let audio = audioCache.get(soundPath)

    if (!audio) {
      audio = new Audio(soundPath)
      audioCache.set(soundPath, audio)
    } else {
      // Reset the audio if it's already playing
      audio.pause()
      audio.currentTime = 0
    }

    // Set volume based on master and category volumes
    const baseVolume = masterVolume * categoryVolumes[category]
    audio.volume = options.volume !== undefined ? baseVolume * options.volume : baseVolume

    // Set loop
    audio.loop = options.loop || false

    // Set playback rate (pitch)
    if (options.pitch) {
      audio.playbackRate = options.pitch
    }

    // Play the sound
    audio.play().catch((error) => {
      console.error(`Error playing sound ${soundId}:`, error)
    })
  },

  stopSound: (soundId) => {
    // Find all sounds that match the ID and stop them
    for (const category in soundPaths) {
      const categoryPaths = soundPaths[category as SoundCategory]
      for (const id in categoryPaths) {
        if (id.includes(soundId)) {
          const path = categoryPaths[id]
          const audio = audioCache.get(path)
          if (audio) {
            audio.pause()
            audio.currentTime = 0
          }
        }
      }
    }
  },

  playMusic: (musicId, loop = true) => {
    const { stopMusic, playSound } = get()

    // Stop current music if playing
    stopMusic()

    // Play new music
    playSound("music", musicId, { loop })
    set({ currentMusic: musicId, musicLoop: loop })
  },

  stopMusic: () => {
    const { currentMusic } = get()

    if (currentMusic) {
      // Find the music in the cache and stop it
      for (const id in soundPaths.music) {
        if (id === currentMusic) {
          const path = soundPaths.music[id as keyof typeof soundPaths.music]
          const audio = audioCache.get(path)
          if (audio) {
            audio.pause()
            audio.currentTime = 0
          }
        }
      }

      set({ currentMusic: null })
    }
  },

  getWeaponSound: (weaponType, soundType) => {
    // Map weapon types to their sound IDs
    const weaponSoundMap: Record<string, Record<WeaponSoundType, string>> = {
      assaultRifle: {
        fire: "m4a1_fire",
        reload_start: "m4a1_reload_start",
        reload_mid: "m4a1_reload_mid",
        reload_end: "m4a1_reload_end",
        empty: "weapon_empty",
        switch: "weapon_switch",
      },
      submachineGun: {
        fire: "mp5_fire",
        reload_start: "mp5_reload_start",
        reload_mid: "mp5_reload_mid",
        reload_end: "mp5_reload_end",
        empty: "weapon_empty",
        switch: "weapon_switch",
      },
      shotgun: {
        fire: "shotgun_fire",
        reload_start: "shotgun_reload_start",
        reload_mid: "shotgun_reload_mid",
        reload_end: "shotgun_reload_end",
        empty: "weapon_empty",
        switch: "weapon_switch",
      },
      sniperRifle: {
        fire: "sniper_fire",
        reload_start: "sniper_reload_start",
        reload_mid: "sniper_reload_mid",
        reload_end: "sniper_reload_end",
        empty: "weapon_empty",
        switch: "weapon_switch",
      },
      pistol: {
        fire: "pistol_fire",
        reload_start: "pistol_reload_start",
        reload_mid: "pistol_reload_mid",
        reload_end: "pistol_reload_end",
        empty: "weapon_empty",
        switch: "weapon_switch",
      },
      knife: {
        fire: "knife_swing",
        reload_start: "",
        reload_mid: "",
        reload_end: "",
        empty: "",
        switch: "weapon_switch",
      },
      grenade: {
        fire: "grenade_throw",
        reload_start: "grenade_pin",
        reload_mid: "",
        reload_end: "",
        empty: "",
        switch: "weapon_switch",
      },
    }

    // Get the sound ID for the weapon type and sound type
    return weaponSoundMap[weaponType]?.[soundType] || "weapon_empty"
  },
}))

// Helper function to play a sound with positional audio
export function playPositionalSound(
  category: SoundCategory,
  soundId: string,
  position: [number, number, number],
  listenerPosition: [number, number, number],
  options: Omit<PlaySoundOptions, "position"> = {},
) {
  // Calculate distance between listener and sound source
  const dx = listenerPosition[0] - position[0]
  const dy = listenerPosition[1] - position[1]
  const dz = listenerPosition[2] - position[2]
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

  // Calculate volume based on distance (inverse square law)
  const maxDistance = 50 // Maximum distance at which sound is audible
  const volume = Math.max(0, 1 - distance / maxDistance)

  // If sound is audible, play it
  if (volume > 0) {
    useSoundStore.getState().playSound(category, soundId, {
      ...options,
      volume: volume * (options.volume || 1),
    })
  }
}

// Helper function to get a random footstep sound based on surface
export function getRandomFootstepSound(surface: "concrete" | "grass" | "metal"): string {
  const random = Math.floor(Math.random() * 4) + 1
  return `footstep_${surface}_${random}`
}

// Helper function to preload commonly used sounds
export function preloadCommonSounds() {
  const commonSounds = [
    { category: "weapon" as SoundCategory, id: "m4a1_fire" },
    { category: "weapon" as SoundCategory, id: "weapon_switch" },
    { category: "player" as SoundCategory, id: "footstep_concrete_1" },
    { category: "player" as SoundCategory, id: "footstep_grass_1" },
    { category: "player" as SoundCategory, id: "footstep_metal_1" },
    { category: "player" as SoundCategory, id: "jump" },
    { category: "player" as SoundCategory, id: "land" },
    { category: "ui" as SoundCategory, id: "ui_click" },
  ]

  commonSounds.forEach(({ category, id }) => {
    const path = soundPaths[category]?.[id]
    if (path && !audioCache.has(path)) {
      const audio = new Audio(path)
      audio.preload = "auto"
      audioCache.set(path, audio)
    }
  })
}
