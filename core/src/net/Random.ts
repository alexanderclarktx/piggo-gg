import { round } from "@piggo-gg/core"

export type Random = {
  seed: number,
  index: number,
  next: () => number
  int: (range: number, subtract?: number) => number
}

export const Random = (startingSeed: number): Random => {
  const random: Random = {
    seed: startingSeed,
    index: 0,
    next: () => {
      random.seed = (1664525 * random.seed + 1013904223) % 4294967296; // LCG formula
      return (random.seed >>> 0) / 4294967296; // Convert to 0-1 range
    },
    int: (range: number, subtract: number = 0) => {
      const n = random.next()
      return round(n * range - subtract)
    }
  }
  return random
}
