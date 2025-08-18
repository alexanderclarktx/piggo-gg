import { entries, GunNames, World, XY, XYdistance } from "@piggo-gg/core"
import { getContext, getTransport, Player as Tone } from "tone"

export type BirdSounds = "steps" | "birdsong1"
export type BubbleSounds = "bubble"
export type MusicSounds = "track1" | "track2" | "track3" | "track5"
export type ClickSounds = "click1" | "click2" | "click3" | "cassettePlay" | "cassetteStop"
export type ToolSounds = "whiff" | "thud" | "clink" | "slash"
export type EatSounds = "eat" | "eat2"
export type WallPlaceSounds = "wallPlace1" | "wallPlace2"
export type VolleySounds = "spike"

export type ValidSounds =
  BirdSounds | BubbleSounds | MusicSounds | ClickSounds |
  GunNames | WallPlaceSounds | ToolSounds | EatSounds | VolleySounds

const load = (url: string, volume: number): Tone => {
  const player = new Tone({ url, volume: volume - 10 })
  return player.toDestination()
}

export type SoundPlayProps = {
  name: ValidSounds
  start?: number | string
  fadeIn?: number | string
  threshold?: {
    pos: XY // TODO xyz
    distance: number
  }
}

export type Sound = {
  music: { state: "stop" | "play", track: MusicSounds }
  muted: boolean
  state: "closed" | "running" | "suspended"
  tones: Record<ValidSounds, Tone>
  ready: boolean
  stop: (name: ValidSounds) => void
  stopAll: () => void
  play: (props: SoundPlayProps) => boolean
}

export const Sound = (world: World): Sound => {

  // mute when tab is not visible
  document.addEventListener("visibilitychange", () => {
    sound.muted = document.hidden
    if (document.hidden) sound.stopAll()
  })

  // mute when window is not focused
  window.addEventListener("blur", () => {
    sound.muted = true
    sound.stopAll()
  })

  // unmute when window is focused
  window.addEventListener("focus", () => sound.muted = false)

  const sound: Sound = {
    music: { state: "stop", track: "track1" },
    muted: false,
    state: "closed",
    ready: false,
    tones: {
      birdsong1: load("birdsong1.mp3", -20),
      steps: load("steps.mp3", 0),
      bubble: load("bubble.mp3", -10),
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
      thud: load("thud.mp3", -15),
      clink: load("clink.mp3", -10),
      whiff: load("whiff.wav", -15),
      slash: load("slash.mp3", -20),
      eat: load("eat.mp3", -10),
      eat2: load("eat2.mp3", -10),
      spike: load("spike.mp3", 5),
    },
    stop: (name: ValidSounds) => {
      const tone = sound.tones[name]
      if (tone) {
        try {
          tone.stop()
        }
        catch (e) {
          console.error(`error while stopping sound ${tone}`)
        }
      }
    },
    stopAll: () => {
      for (const [name, tone] of entries(sound.tones)) {
        if (tone.state === "started") {
          try {
            if (name.startsWith("track")) {
              // sound.mute = true
            } else {
              tone.stop()
            }
          } catch (e) {
            console.error(`error while stopping sound ${tone}`)
          }
        }
      }
    },
    play: ({ name, start = 0, fadeIn = 0, threshold }) => {
      if (sound.muted && !name.startsWith("track")) return false

      // check distance
      if (threshold) {
        const character = world.client?.playerCharacter()
        if (character) {
          const distance = XYdistance(character.components.position.data, threshold.pos)
          if (distance > threshold.distance) return false
        }
      }

      try {
        if (sound.state !== "running") {
          sound.state = getContext().state
          getTransport().cancel().start("+0")
        }

        const tone = sound.tones[name]
        if (tone && tone.loaded) {
          tone.start(fadeIn, start)
          return true
        }
      } catch (e) {
        console.error(`error while playing sound ${name}`)
        return false
      }

      return false
    }
  }
  return sound
}
