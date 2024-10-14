import { Action, Item } from "@piggo-gg/core"

export const Pickup = Action(({player, entity, world}) => {
  if (!entity) return

  const character = player?.components.controlling.getControlledEntity(world)
  if (!character) return

  const { inventory } = character.components
  if (!inventory) return

  const { name, position, actions, effects, droppable, collider } = entity.components

  if(!name) return
  if (!position) return
  if (!actions) return
  if (!effects) return
  if (!droppable) return

  console.log(`pickup character:${character.id} entity:${entity.id}`)

  droppable.dropped = false
  position.data.follows = character.id
  if (collider) collider.active = false

  inventory.addItem(entity as Item)
})

export const Drop = Action(({player, world}) => {
  const character = player?.components.controlling.getControlledEntity(world)
  if (!character) return

  const { inventory } = character.components
  if (!inventory) return

  const activeItem = inventory.activeItem()
  if (!activeItem) return

  const { droppable, position, collider, renderable } = activeItem.components

  console.log(`drop character:${character.id} entity:${activeItem.id}`)

  droppable.dropped = true
  position.data.follows = undefined
  renderable.position = { x: 0, y: 0 }
  if (collider) collider.active = true

  inventory.dropActiveItem()
}, 10)
