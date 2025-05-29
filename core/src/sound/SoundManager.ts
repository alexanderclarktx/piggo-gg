import { entries, GunNames, World, XY, XYdistance } from "@piggo-gg/core"
import { getContext, getTransport, Player as Sound } from "tone"

export type MusicSounds = "track1" | "track2" | "track3" | "track5"
export type ClickSounds = "click1" | "click2" | "click3" | "cassettePlay" | "cassetteStop"
export type ToolSounds = "whiff" | "thud" | "clink" | "slash"
export type EatSounds = "eat" | "eat2"
export type WallPlaceSounds = "wallPlace1" | "wallPlace2"
export type ZombiDeathSounds = "zombieDeath1" | "zombieDeath2" | "zombieDeath3" | "zombieDeath4"
export type ZomiAttackSounds = "attack1" | "attack2" | "attack3" | "attack4"
export type VolleySounds = "spike"

export type ValidSounds = MusicSounds | ClickSounds | GunNames | WallPlaceSounds | ZombiDeathSounds | ZomiAttackSounds | ToolSounds | EatSounds | VolleySounds

const load = (url: string, volume: number): Sound => {
  const player = new Sound({ url, volume: volume - 10 })
  return player.toDestination()
}

export type SoundManager = {
  music: { state: "stop" | "play", track: MusicSounds }
  muted: boolean
  state: "closed" | "running" | "suspended"
  sounds: Record<ValidSounds, Sound>
  ready: boolean
  stop: (soundName: ValidSounds) => void
  stopAll: () => void
  play: (sound: ValidSounds, startTime?: number, fadeIn?: number | string, pos?: XY, force?: boolean) => boolean
}

export const SoundManager = (world: World): SoundManager => {

  // mute when tab is not visible
  document.addEventListener("visibilitychange", () => {
    soundManager.muted = document.hidden
    if (document.hidden) soundManager.stopAll()
  })

  // mute when window is not focused
  window.addEventListener("blur", () => {
    soundManager.muted = true
    soundManager.stopAll()
  })

  // unmute when window is focused
  window.addEventListener("focus", () => soundManager.muted = false)

  const soundManager: SoundManager = {
    music: { state: "stop", track: "track1" },
    muted: false,
    state: "closed",
    ready: false,
    sounds: {
      // piano1: load("piano1.mp3", 5),
      track1: load("track1.mp3", -10),
      track2: load("track2.mp3", -10),
      track3: load("track3.mp3", -10),
      // track4: load("track4.mp3", -10),
      track5: load("track5.mp3", -10),
      cassettePlay: load("cassettePlay.mp3", 0),
      cassetteStop: load("cassetteStop.mp3", -5),
      click1: load("click1.mp3", -5),
      click2: load("click2.mp3", -5),
      click3: load("click3.mp3", -10),
      deagle: load("pistol.mp3", -30),
      ak: load("ak.mp3", -25),
      awp: load("awp.mp3", -30),
      wallPlace1: load("wallPlace1.wav", -20),
      wallPlace2: load("wallPlace2.wav", -20),
      zombieDeath1: load("zombieDeath1.wav", -25),
      zombieDeath2: load("zombieDeath2.wav", -25),
      zombieDeath3: load("zombieDeath3.wav", -25),
      zombieDeath4: load("zombieDeath4.wav", -25),
      attack1: load("attack1.wav", -25),
      attack2: load("attack2.wav", -25),
      attack3: load("attack3.wav", -25),
      attack4: load("attack4.wav", -25),
      thud: load("thud.mp3", -15),
      clink: load("clink.mp3", -10),
      whiff: load("whiff.wav", -15),
      slash: load("slash.mp3", -20),
      eat: load("eat.mp3", -20),
      eat2: load("eat2.mp3", -20),
      spike: load("spike.mp3", 5),
    },
    stop: (soundName: ValidSounds) => {
      const sound = soundManager.sounds[soundName]
      if (sound) {
        try {
          sound.stop()
        }
        catch (e) {
          console.error(`error while stopping sound ${sound}`)
        }
      }
    },
    stopAll: () => {
      for (const [name, sound] of entries(soundManager.sounds)) {
        if (sound.state === "started") {
          try {
            if (name.startsWith("track")) {
              // sound.mute = true
            } else {
              sound.stop()
            }
          } catch (e) {
            console.error(`error while stopping sound ${sound}`)
          }
        }
      }
    },
    play: (soundName: ValidSounds, startTime: number | string = 0, fadeIn: number = 0, pos: XY | undefined = undefined) => {
      if (soundManager.muted && !soundName.startsWith("track")) return false

      // check distance
      if (pos) {
        const character = world.client?.playerCharacter()
        if (character) {
          const distance = XYdistance(character.components.position.data, pos)
          if (distance > 250) return false
        }
      }

      try {
        if (soundManager.state !== "running") {
          soundManager.state = getContext().state
          getTransport().cancel().start("+0")
        }

        const sound = soundManager.sounds[soundName]
        if (sound && sound.loaded) {
          sound.start(fadeIn, startTime)
          return true
        }
      } catch (e) {
        console.error(`error while playing sound ${soundName}`)
        return false
      }

      return false
    }
  }
  return soundManager
}
