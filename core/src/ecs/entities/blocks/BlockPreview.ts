import { floor, hypot, min, OutlineMaterial, World, XYZ } from "@piggo-gg/core"
import { BoxGeometry, Mesh } from "three"

export type Preview = {
  mesh: Mesh
  update: (pos: XYZ, dir: XYZ) => void
}

export const BlockPreview = (world: World): null | Preview => {
  if (!world.client) return null

  const geometry = new BoxGeometry(0.3001, 0.3001, 0.3001)
  const material = OutlineMaterial()

  const mesh = new Mesh(geometry, material)
  mesh.position.set(10, 10, 10)
  return {
    mesh,
    update: (pos: XYZ, dir: XYZ) => {

      let travelled = 0
      let cap = 10

      while (travelled < 10 && cap > 0) {

        const xGap = (pos.x + 0.15) % 0.3
        const yGap = (pos.y + 0.15) % 0.3
        const zGap = pos.z % 0.3

        const xStep = dir.x > 0 ? (0.3 - xGap) / dir.x : (xGap / -dir.x)
        const yStep = dir.z > 0 ? (0.3 - yGap) / dir.z : (yGap / -dir.z)
        const zStep = dir.y > 0 ? (0.3 - zGap) / dir.y : (zGap / -dir.y)

        const minStep = min(xStep, yStep, zStep)

        const xDist = dir.x * minStep * 1.01
        const yDist = dir.z * minStep * 1.01
        const zDist = dir.y * minStep * 1.01

        pos.x += xDist
        pos.y += yDist
        pos.z += zDist

        travelled += hypot(xDist, yDist, zDist)
        cap -= 1

        const insideBlock = {
          x: floor((0.15 + pos.x) / 0.3),
          y: floor((0.15 + pos.y) / 0.3),
          z: floor(pos.z / 0.3)
        }

        if (world.blocks.atIJK(insideBlock)) {
          mesh.position.x = insideBlock.x * 0.3
          mesh.position.y = insideBlock.z * 0.3 + 0.15
          mesh.position.z = insideBlock.y * 0.3
          mesh.rotation.set(0, 0, 0)

          mesh.visible = true
          return
        }
      }

      mesh.visible = false
    }
  }
}
