import { Data, Entity, Networked, round, SystemBuilder } from "@piggo-gg/core"

export type Random = {
  seed: Entity<Data>,
  index: number,
  next: () => number
  int: (range: number, subtract?: number) => number
}

export const Random = (startingSeed: number): Random => {
  const random: Random = {
    seed: Entity<Data>({
      id: "random",
      components: {
        networked: Networked(),
        data: Data({
          data: { seed: startingSeed }
        })
      }
    }),
    index: 0,
    next: () => {
      const current = random.seed.components.data.data.seed as number
      const next = (1664525 * current + 1013904223) % 4294967296

      random.seed.components.data.set("seed", next)
      return (next >>> 0) / 4294967296
    },
    int: (range: number, subtract: number = 0) => {
      const n = random.next()
      return round(n * range - subtract)
    }
  }
  return random
}

export const RandomSystem = SystemBuilder({
  id: "RandomSystem",
  init: (world) => {
    const randomSystem = {
      id: "RandomSystem",
      query: [],
      onTick: () => {
        if (!world.entities["random"]) {
          world.addEntity(world.random.seed)
        }
      }
    }
    return randomSystem
  }
})
