import { Action, Entity, Position } from "@piggo-gg/core"

export const Eat = Action<{ target: Entity<Position> }>(({ entity, params, world }) => {
  if (!entity) return

  const { target } = params
  if (!target || !world.entities[target.id]) return

  world.removeEntity(target.id)

  if (entity.components.renderable?.scale) {
    entity.components.renderable.scale += 0.5
  }

  if (entity.components.collider) {
    // @ts-expect-error
    entity.components.collider.colliderDesc.shape.radius *= 1.1
  }
})
