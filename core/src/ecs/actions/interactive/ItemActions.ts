import { Action, Item } from "@piggo-gg/core"

export const PickupItem = Action(({player, entity, world}) => {
  if (!entity) return

  const character = player?.components.controlling.getControlledEntity(world)
  if (!character) return

  const { inventory } = character.components
  if (!inventory) return

  const { name, position, actions, effects, droppable, collider } = entity.components
  if (!name || !position || !actions || !effects || !droppable) return

  droppable.dropped = false
  position.data.follows = character.id
  if (collider) collider.active = false

  inventory.addItem(entity as Item)
})

export const DropItem = Action(({player, world}) => {
  const character = player?.components.controlling.getControlledEntity(world)
  if (!character) return

  const { inventory } = character.components
  if (!inventory) return

  const activeItem = inventory.activeItem()
  if (!activeItem) return

  const { droppable, position, collider, renderable } = activeItem.components

  droppable.dropped = true
  position.data.follows = undefined
  if (collider) collider.active = true

  renderable.position = { x: 0, y: 0 }

  inventory.dropActiveItem()
}, 10)
