import { Action, ItemEntity } from "@piggo-gg/core"

export const setActiveItemIndex = Action<{ index: number }>(({ params, entity }) => {
  if (params.index === null || params.index === undefined) return

  const inventory = entity?.components.inventory
  if (!inventory) return

  inventory.setActiveItemIndex(params.index)
})

export const PickupItem = Action(({player, entity, world}) => {
  if (!entity) return

  const character = player?.components.controlling.getControlledEntity(world)
  if (!character) return

  const { inventory } = character.components
  if (!inventory) return

  const { position, actions, effects, item, collider, renderable, clickable } = entity.components
  if (!position || !actions || !effects || !item || !renderable) return

  item.dropped = false

  position.data.follows = character.id
  position.data.rotation = 0

  renderable.visible = false

  if (clickable) clickable.active = false
  if (collider) collider.active = false

  inventory.addItem(entity as ItemEntity)
})

export const DropItem = Action(({player, world}) => {
  const character = player?.components.controlling.getControlledEntity(world)
  if (!character) return

  const { inventory } = character.components
  if (!inventory) return

  const activeItem = inventory.activeItem()
  if (!activeItem) return

  const { item, position, collider, clickable } = activeItem.components

  item.dropped = true
  position.data.follows = undefined
  position.setVelocity()

  if (clickable) clickable.active = true
  if (collider) collider.active = true

  inventory.dropActiveItem()
}, 10)