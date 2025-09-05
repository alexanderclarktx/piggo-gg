import { blockFromXYZ, floor, hypot, min, World, XYZ } from "@piggo-gg/core"
import { Mesh, MeshBasicMaterial, Object3DEventMap, PlaneGeometry, SphereGeometry } from "three"


// Mesh<CylinderGeometry, MeshBasicMaterial, Object3DEventMap>
export type Preview = {
  mesh: Mesh<SphereGeometry, MeshBasicMaterial, Object3DEventMap>
  update: (pos: XYZ, dir: XYZ) => void
}

export const Preview = (world: World): null | Preview => {
  if (!world.client) return null

  // const geometry = new PlaneGeometry(0.3, 0.3)
  const geometry = new SphereGeometry(3, 16, 16)
  const material = new MeshBasicMaterial({ color: 0xffffff, side: 2 })

  const mesh = new Mesh(geometry, material)
  mesh.position.set(10, 10, 10)
  return {
    mesh,
    update: (pos: XYZ, dir: XYZ) => {
      // mesh.position.copy(pos)
      // mesh.lookAt(aim)

      // console.log("update from", pos, dir)

      const current = { ...pos }

      const lastBlock = blockFromXYZ(current)

      let travelled = 0
      let cap = 10

      while (travelled < 10 && cap > 0) {

        const xGap = (current.x + 0.15) % 0.3
        const yGap = (current.y + 0.15) % 0.3
        const zGap = (current.z + 0.15) % 0.3

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

        // const type = world.blocks.atIJK(insideBlock)
        const type = 0
        if (type) {
          // find which face
          const face = {
            x: dir.x > 0 ? "right" : dir.x < 0 ? "left" : undefined,
            y: dir.y > 0 ? "top" : dir.y < 0 ? "bottom" : undefined,
            z: dir.z > 0 ? "front" : dir.z < 0 ? "back" : undefined
          }

          // move preview to that face
          if (face.x) {
            mesh.position.x = insideBlock.x * 0.3 + (face.x === "right" ? 0.15 : 0)
          }
          if (face.y) {
            mesh.position.y = 2 + insideBlock.z * 0.3 + (face.z === "front" ? 0.15 : 0)
          }
          if (face.z) {
            mesh.position.z = insideBlock.y * 0.3 + (face.y === "top" ? 0.15 : 0)
          }

          console.log(`mesh pos x:${mesh.position.x}, y:${mesh.position.y}, z:${mesh.position.z}`)

          mesh.visible = true
          // needs update
          mesh.material.needsUpdate = true
          mesh.updateMatrixWorld()
          return
        }
      }
    }
  }
}
