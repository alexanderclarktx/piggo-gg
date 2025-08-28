import { Action, floor, hypot, min, XYZ } from "@piggo-gg/core"

export type PlaceParams = {
  pos: XYZ
  dir: XYZ
}

export const Place = Action<PlaceParams>("place", ({ params, world }) => {
  const { pos, dir } = params

  console.log("looking")

  const current = { ...pos }

  let travelled = 0
  let cap = 40

  while (travelled < 10 && cap > 0) {

    const xGap = (current.x + 0.15) % 0.3
    const yGap = (current.y + 0.15) % 0.3
    const zGap = current.z % 0.3

    const xStep = dir.x > 0 ? (0.3 - xGap) / dir.x : (xGap / -dir.x)
    const yStep = dir.z > 0 ? (0.3 - yGap) / dir.z : (yGap / -dir.z)
    const zStep = dir.y > 0 ? (0.3 - zGap) / dir.y : (zGap / -dir.y)

    const minStep = min(xStep, yStep, zStep)

    const xDist = dir.x * minStep * 1.01
    const yDist = dir.z * minStep * 1.01
    const zDist = dir.y * minStep * 1.01

    current.x += xDist
    current.y += yDist
    current.z += zDist

    travelled += hypot(xDist, yDist, zDist)
    cap -= 1

    const insideBlock = {
      x: floor((0.15 + current.x) / 0.3),
      y: floor((0.15 + current.y) / 0.3),
      z: floor(current.z / 0.3)
    }

    if (world.blocks.hasIJK(insideBlock)) {
      console.log("found block at", insideBlock)
      world.blocks.remove(insideBlock)
      return
    }
  }

  console.log("nothing")
})
