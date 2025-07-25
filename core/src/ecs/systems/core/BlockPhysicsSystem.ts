import { Collider, Entity, Position, SystemBuilder } from "@piggo-gg/core"


export const BlockPhysicsSystem = () => SystemBuilder({
  id: "BlockPhysicsSystem",
  init: (world) => {

    // let bodies

    return {
      id: "BlockPhysicsSystem",
      query: ["position", "collider"],
      priority: 7,
      onTick: (entities: Entity<Position | Collider>[]) => {
        for (const entity of entities) {
          const { position, collider } = entity.components

          const { velocity } = position.data

          if (collider.isStatic) continue

          // Apply gravity
          // velocity.y += world.gravity

          // Move the entity
          position.data.x += velocity.x / 1000 * 40
          position.data.y += velocity.y / 1000 * 40
        }
      }
    }
  }
})
