import { ClientSystemBuilder, MusicSounds, randomInt } from "@piggo-gg/core"

export const MusicSystem = ClientSystemBuilder({
  id: "MusicSystem",
  init: (world) => {

    const tracks: MusicSounds[] = ["track1", "track2", "track3", "track5"]
    let track = randomInt(4, 1)

    let playing = false

    const play = () => {
      if (!world.client) return
      if (!playing) {
        playing = world.client?.soundManager.play(tracks[track])
        // if (playing) console.log("playing track", tracks[track])
      }
    }

    return {
      id: "MusicSystem",
      query: [],
      priority: 2,
      onTick: () => {
        if (!playing) {
          play()
        } else {
          if (world.client!.soundManager.sounds[tracks[track]].state === "stopped") {
            track = (track + 1) % tracks.length
            playing = false
          }
        }
      }
    }
  }
})
