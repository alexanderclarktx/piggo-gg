import { Data, Entity, floor, Networked, round, SystemBuilder } from "@piggo-gg/core"
import { createNoise2D } from "simplex-noise"

export type sampleProps = {
  x: number
  y: number
  factor: number
  octaves: number
}

export type Random = {
  index: number,
  seed: Entity<Data>,
  startingSeed: number,
  int: (range: number, subtract?: number) => number
  next: () => number
  noise: (props: sampleProps) => number
  range: <T>(input: number, range: [number, T][]) => T
}

export const Random = (startingSeed: number): Random => {

  const random: Random = {
    index: 0,
    noise: ({ x, y, factor, octaves }: sampleProps): number => {

      let value = 0

      for (let octave = 1; octave <= octaves; octave++) {
        const frequency = Math.pow(2, octave)
        const amplitude = Math.pow(0.5, octave)

        const sampled = (1 + simplex(x / 100 * frequency, y / 100 * frequency)) / 2
        value += sampled * amplitude
      }

      return floor(value * factor)
    },
    seed: Entity<Data>({
      id: "random",
      components: {
        networked: Networked(),
        data: Data({
          data: { seed: startingSeed }
        })
      }
    }),
    startingSeed,
    next: () => {
      const current = random.seed.components.data.data.seed as number
      const next = (1664525 * current + 1013904223) % 4294967296

      random.seed.components.data.set("seed", next)
      return (next >>> 0) / 4294967296
    },
    int: (range: number, subtract: number = 0) => {
      const n = random.next()
      return round(n * range - subtract)
    },
    range: <T>(input: number, range: [number, T][]): T => {
      if (range.length === 0) {
        throw new Error('Input and range must not be empty')
      }

      let result = range.at(-1)![1]

      for (const [threshold, value] of range) {
        if (input <= threshold) {
          result = value
          break
        }
      }

      return result
    }
  }

  const simplex = createNoise2D(random.next)

  return random
}

export const RandomSystem = SystemBuilder({
  id: "RandomSystem",
  init: (world) => {
    const randomSystem = {
      id: "RandomSystem",
      query: [],
      priority: 1,
      onTick: () => {
        if (!world.entity("random")) {
          world.addEntity(world.random.seed)
        }
      }
    }
    return randomSystem
  }
})
