import { Action, blockFromXYZ, floor, hypot, min, XYZ, XYZequal } from "@piggo-gg/core"

export type PlaceParams = {
  pos: XYZ
  dir: XYZ
}

export const Place = Action<PlaceParams>("place", ({ params, world, entity }) => {
  const { pos, dir } = params

  const current = { ...pos, z: pos.z + 0.2 }

  const playerBlock = blockFromXYZ(pos)
  const lastBlock = blockFromXYZ(current)

  let travelled = 0
  let cap = 15

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

    const type = world.blocks.atIJK(insideBlock)
    if (type) {
      // don't place inside player
      if (XYZequal(lastBlock, playerBlock)) return

      const added = world.blocks.add({ type, ...lastBlock })
      if (added) world.client?.sound.play({ name: "click2" })
      return
    }

    lastBlock.x = insideBlock.x
    lastBlock.y = insideBlock.y
    lastBlock.z = insideBlock.z
  }
})
