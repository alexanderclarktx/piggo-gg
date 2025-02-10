import { GunNames, isArray, isMobile, randomChoice, World, XY, XYdistance } from "@piggo-gg/core"
import { getContext, getTransport, Player as Sound } from "tone"

export type ToolSounds = "whiff" | "thud" | "clink" | "slash"
export type EatSounds = "eat" | "eat2"
export type WallPlaceSounds = "wallPlace1" | "wallPlace2"
export type ZombiDeathSounds = "zombieDeath1" | "zombieDeath2" | "zombieDeath3" | "zombieDeath4"
export type ZomiAttackSounds = "attack1" | "attack2" | "attack3" | "attack4"

export type ValidSounds = GunNames | WallPlaceSounds | ZombiDeathSounds | ZomiAttackSounds | ToolSounds | EatSounds

const load = (url: string, volume: number): Sound => {
  const player = new Sound({ url, volume: volume - 10 })
  return player.toDestination()
}

export type SoundManager = {
  muted: boolean
  state: "closed" | "running" | "suspended"
  sounds: Record<ValidSounds, Sound>
  play: (sound: ValidSounds | ValidSounds[], startTime?: number, pos?: XY) => void
}

export const SoundManager = (world: World): SoundManager => {

  // mute when tab is not visible
  document.addEventListener("visibilitychange", () => soundManager.muted = document.hidden)

  // mute when window is not focused
  window.addEventListener("blur", () => soundManager.muted = true)

  // unmute when window is focused
  window.addEventListener("focus", () => soundManager.muted = false)

  const soundManager: SoundManager = {
    muted: false,
    state: "closed",
    sounds: {
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
      clink: load("clink.mp3", -15),
      whiff: load("whiff.wav", -15),
      slash: load("slash.mp3", -20),
      eat: load("eat.mp3", -20),
      eat2: load("eat2.mp3", -20)
    },
    play: (soundName: ValidSounds | ValidSounds[], startTime: number = 0, pos: XY | undefined = undefined) => {
      if (soundManager.muted) return

      // if the sound is too far away, don't play it
      if (pos) {
        const character = world.client?.playerCharacter()
        if (character) {
          const distance = XYdistance(character.components.position.data, pos)
          if (distance > 250) return
        }
      }

      try {
        if (soundManager.state !== "running") {
          soundManager.state = getContext().state
          getTransport().start()
        }

        if (soundManager.state !== "running" && isMobile()) return

        if (isArray(soundName)) {
          const choice = randomChoice(soundName)
          const sound = soundManager.sounds[choice]
          if (sound) sound.start(0, startTime)
        } else {
          const sound = soundManager.sounds[soundName]
          if (sound) sound.start(0, startTime)
        }
      } catch (e) {
        console.error("error while playing a sound", e)
      }
    }
  }
  return soundManager
}
