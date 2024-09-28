import { GunNames, isArray, isMobile, randomChoice } from "@piggo-gg/core"
import { getContext, getTransport, Player } from "tone"

export type Sound = Player

export type ToolSounds = "whiff" | "thud" | "clink"

export type WallPlaceSounds = "wallPlace1" | "wallPlace2"
export type ZombiDeathSounds = "zombieDeath1" | "zombieDeath2" | "zombieDeath3" | "zombieDeath4"
export type ZomiAttackSounds = "attack1" | "attack2" | "attack3" | "attack4"

export type ValidSounds =
  GunNames | WallPlaceSounds | ZombiDeathSounds | ZomiAttackSounds | ToolSounds

export type Sounds = Record<ValidSounds, Sound>

let state: "closed" | "running" | "suspended" = "closed"

export const playSound = (sound: Sound | (Sound | undefined)[] | undefined, startTime: number = 0) => {
  if (!sound) return

  try {
    if (state !== "running") {
      state = getContext().state
      getTransport().start()
    }

    if (state !== "running" && isMobile()) return

    if (isArray(sound)) {
      const choice = randomChoice(sound)
      if (choice?.loaded) choice.start(0, startTime)
    } else {
      if (sound.loaded) sound.start(0, startTime)
    }
  } catch (e) {
    console.error("error while playing a sound", e)
  }
}

const load = (url: string, volume: number): Sound => {
  const player = new Player({ url, volume })
  return player.toDestination()
}

export const Sounds = (): Sounds => ({
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
  whiff: load("whiff.mp3", -15),
  thud: load("thud.mp3", -15),
  clink: load("clink.mp3", -15),
})
