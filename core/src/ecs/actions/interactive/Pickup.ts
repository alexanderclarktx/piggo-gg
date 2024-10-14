import { Action, Item } from "@piggo-gg/core"

export const Pickup = Action(({player, entity, world}) => {
  console.log(`pickup player:${player?.components.player?.data.name} entity:${entity?.id}`)

  if (!entity) return

  const character = player?.components.controlling.getControlledEntity(world)
  if (!character) return

  const { inventory } = character.components
  if (!inventory) return

  if (!entity.components.name) return
  if (!entity.components.position) return
  if (!entity.components.actions) return
  if (!entity.components.effects) return
  if (!entity.components.name) return
  if (!entity.components.droppable) return

  // world.removeEntity(entity.id)
  entity.components.droppable.dropped = false

  inventory.addItem(entity as Item)
})
