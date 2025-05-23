import { World } from "@piggo-gg/core"

export const logPerf = (message: string, from: DOMHighResTimeStamp, threshold: number = 5) => {
  const time = performance.now() - from
  if (time > threshold) {
    console.log(message, time)
  }
}

export const logRare = (message: any, world: World, rate: number = 100) => {
  if (world.tick % rate === 0) {
    console.log(message)
  }
}
