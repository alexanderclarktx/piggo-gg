import { Action, Entity, Position } from "@piggo-gg/core"

export const Chase = Action<{ target: string }>("chase", ({ entity, params, world }) => {
  if (!entity) return

  const { position } = entity.components
  if (!position) return

  const { target } = params

  const targetEntity = world.entity<Position>(target)
  if (!targetEntity) return

  position.setHeading(targetEntity.components.position.data)
})
