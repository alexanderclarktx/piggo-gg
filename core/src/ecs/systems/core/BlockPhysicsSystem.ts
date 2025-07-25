import { Collider, Entity, logRare, Position, SystemBuilder } from "@piggo-gg/core"

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

          const { velocity } = position.data

          if (collider.isStatic) continue

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
          position.data.x += velocity.x / 40
          position.data.y += velocity.y / 40

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
