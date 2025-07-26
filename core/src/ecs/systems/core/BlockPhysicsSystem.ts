import { blocks, Collider, Entity, floor, max, Position, round, sign, SystemBuilder, XYZ } from "@piggo-gg/core"

const addToVector = (vec: XYZ, amount: number): XYZ => {

  const total = Math.hypot(vec.x, vec.y)
  const xRatio = vec.x / total
  const yRatio = vec.y / total

  return {
    x: vec.x + xRatio * amount * sign(vec.x),
    y: vec.y + yRatio * amount * sign(vec.y),
    z: vec.z
  }
}

export const BlockPhysicsSystem = (mode: "global" | "local") => SystemBuilder({
  id: mode === "global" ? "BlockPhysicsSystem" : "LocalBlockPhysicsSystem",
  init: (world) => {

    if (mode === "local" && world.mode === "server") return undefined

    // let bodies

    return {
      id: mode === "global" ? "BlockPhysicsSystem" : "LocalBlockPhysicsSystem",
      query: ["position", "collider"],
      priority: mode === "global" ? 7 : 9,
      onTick: (entities: Entity<Position | Collider>[]) => {
        for (const entity of entities) {
          const { position, collider } = entity.components

          if (collider.isStatic) continue

          const { velocity, x, y, z } = position.data

          const wouldGoUnscaled: XYZ = {
            x: x + velocity.x / 40,
            y: y + velocity.y / 40,
            z: z + position.data.velocity.z
          }

          // add 0.1 along the vector
          const wouldGo = addToVector(wouldGoUnscaled, 0.1)

          // const ijk = {
          //   x: floor((0.15 + wouldGo.x) / 0.3),
          //   y: floor((0.15 + wouldGo.y) / 0.3),
          //   z: floor((0.15 + wouldGo.z) / 0.3)
          // }
          const ijk = {
            x: floor((0.15 + wouldGo.x) / 0.3),
            y: floor((0.15 + wouldGo.y) / 0.3),
            z: floor((0.15 + wouldGo.z) / 0.3)
          }
          const inBlock = blocks.hasIJK(ijk)

          const blockSize = 0.3
          const r = 0.1

          if (inBlock) {

            const blockMin = {
              x: ijk.x * blockSize - 0.15,
              y: ijk.y * blockSize - 0.15,
              z: ijk.z * blockSize - 0.15,
            }

            const blockMax = {
              x: blockMin.x + blockSize,
              y: blockMin.y + blockSize,
              z: blockMin.z + blockSize,
            }

            // Clamp each axis independently based on which direction it's trying to enter from
            if (velocity.x > 0 && wouldGo.x + r > blockMin.x) {

              position.data.x = round(blockMin.x - 0.05, 2)
              position.data.velocity.x = 0

              if (mode === "local") {
                position.localVelocity.x = 0
                position.localVelocity.y = velocity.y
                return
              }
            } else if (velocity.x < 0 && wouldGo.x - r < blockMax.x) {
              const was = position.data.x

              position.data.x = round(blockMax.x + 0.05, 3)
              position.data.velocity.x = 0

              console.log(`Collided ijk: ${ijk.x} clamped: x:${position.data.x} was: ${was}`)

              if (mode === "local") {
                position.localVelocity.x = 0
                position.localVelocity.y = velocity.y
                return
              }
            }

            // if (velocity.y > 0 && wouldGo.y + r > blockMin.y) {
            //   position.data.y = round(blockMin.y - 0.05, 2)
            //   position.data.velocity.y = 0

            //   if (mode === "local") {
            //     position.localVelocity.x = velocity.x
            //     position.localVelocity.y = 0
            //     return
            //   }
            // } else if (velocity.y < 0 && wouldGo.y - r < blockMax.y) {
            //   position.data.y = round(blockMax.y + 0.05, 2)
            //   position.data.velocity.y = 0

            //   if (mode === "local") {
            //     position.localVelocity.x = velocity.x
            //     position.localVelocity.y = 0
            //     return
            //   }
            // }

            // if (velocity.z > 0 && wouldGo.z + r > blockMin.z) {
              // position.data.z = blockMin.z - r
            // } else if (velocity.z < 0 && wouldGo.z - r < blockMax.z) {
              // position.data.z = blockMax.z + r
            // }

            // if (mode === "local") {
            //   position.localVelocity.x = 0
            //   return
            // }

            // console.log(`Collided with block at ijk: ${ijk.x},${ijk.y},${ijk.z} clamped: x:${position.data.x}, y:${position.data.y}, z:${position.data.z}`)

            // return
          }

          if (mode === "local") {
            position.localVelocity.x = velocity.x
            position.localVelocity.y = velocity.y
            // logRare(`pos: ${position.data.x},${position.data.y} vel: ${velocity.x},${velocity.y} local: ${position.localVelocity.x},${position.localVelocity.y}`, world)
            return
          }

          // gravity & z
          if (position.data.velocity.z || position.data.z) {

            // apply stop
            const wouldGo = position.data.z + position.data.velocity.z
            if (position.data.stop <= position.data.z && wouldGo < position.data.stop) {
              position.data.z = position.data.stop
            } else {
              position.data.z = wouldGo
            }

            // set standing
            if (position.data.z === position.data.stop) {
              position.data.velocity.z = 0
              position.data.standing = true
            } else {
              position.data.standing = false
              if (!position.data.flying) {
                position.data.velocity.z -= position.data.gravity
              }
            }
          } else {
            position.data.standing = true
          }

          // flying direction
          if (position.data.flying) {
            position.data.velocity.z = (position.data.aim.y + 0.2) * 0.1
          }

          // Move the entity
          const was = position.data.x
          position.data.x += position.data.velocity.x / 40
          // console.log("was", was, "now", position.data.x, mode, entity.id, world.tick)
          position.data.y += position.data.velocity.y / 40

          // friction
          if (position.data.friction) {
            const scale = (position.data.standing && !position.data.flying) ? 0.8 : 0.98
            entity.components.position.scaleVelocity(scale)
          }
        }
      }
    }
  }
})
