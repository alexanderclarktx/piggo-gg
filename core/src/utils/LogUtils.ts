import { round, stringify, World } from "@piggo-gg/core"

export const logPerf = (message: string, from: DOMHighResTimeStamp, threshold: number = 5) => {
  const time = round(performance.now() - from, 1)
  if (time > threshold) {
    console.log(message, time)
  }
}

export const logRare = (message: any, world: World, rate: number = 100) => {
  if (world.tick % rate === 0) {
    console.log(message)
  }
}

// diff between two objects
export const logDiff = (local: object, remote: object) => {
  const diff: Record<string, {local: unknown, remote: unknown}> = {}

  // go 1 level deep
  for (const key in local) {
    // @ts-expect-error
    if (typeof local[key] === "object") {
      // @ts-expect-error
      for (const subKey in local[key]) {
        // @ts-expect-error
        if (stringify(local[key][subKey]) !== stringify(remote[key]?.[subKey])) {
          // @ts-expect-error
          diff[`${key}.${subKey}`] = { local: local[key][subKey], remote: remote[key]?.[subKey] }
        }
      }
    } else {
      // @ts-expect-error
      if (stringify(local[key]) !== stringify(remote[key])) {
        // @ts-expect-error
        diff[key] = { local: local[key], remote: remote[key] }
      }
    }
  }

  if (Object.keys(diff).length) {
    for (const key in diff) {
      console.error(`${key}\n< ${stringify(diff[key].local)}\n> ${stringify(diff[key].remote)}`)
    }
  }
}
