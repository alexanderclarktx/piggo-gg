import {
  Actions, Character, Component, Entity, Input, Position,
  Renderable, SystemBuilder, Team, ItemEntity, World
} from "@piggo-gg/core"

export type ItemBuilder = (_: { id?: string, character?: Character }) => ItemEntity

export type Inventory = Component<"inventory", {
  items: (string[] | undefined)[]
  activeItemIndex: number
}> & {
  itemBuilders: ItemBuilder[]
  activeItem: (world: World) => ItemEntity | null
  addItem: (item: ItemEntity, world: World) => void
  includes: (item: ItemEntity) => boolean
  dropActiveItem: () => void
  setActiveItemIndex: (index: number) => void
}

export const Inventory = (itemBuilders: ItemBuilder[] = []): Inventory => {
  const inventory: Inventory = {
    data: {
      activeItemIndex: 0,
      items: [undefined, undefined, undefined, undefined, undefined]
    },
    type: "inventory",
    itemBuilders,
    activeItem: (world: World) => {
      const item = inventory.data.items[inventory.data.activeItemIndex]
      if (!item) return null

      const itemEntity = world.entities[item[0]]
      if (!itemEntity) return null

      return itemEntity as ItemEntity
    },
    addItem: (item: ItemEntity, world: World) => {

      let added = false
      const { items } = inventory.data

      if (item.components.item.stackable) {
        for (const slot of items) {
          if (slot && slot[0] === item.id) {
            slot.push(item.id)
            added = true
            break
          }
        }
      } else {
        for (let i = 0; i < inventory.data.items.length; i++) {
          if (items[i] === undefined) {
            inventory.data.items[i] = [item.id]
            added = true
            break
          }
        }
      }

      if (added && !world.entities[item.id]) {
        world.addEntity(item)
      }
    },
    dropActiveItem: () => {

      const { items, activeItemIndex } = inventory.data

      const slot = items[activeItemIndex]
      if (!slot) return
      if (slot.length > 1) {
        slot.shift()
        return
      }
      items[activeItemIndex] = undefined
    },
    // dropActiveItem: (world: World) => {
    //   const slot = inventory.data.items[inventory.data.activeItemIndex]
    //   if (!slot) return

    //   const item = slot.shift()
    //   if (item) {
    //     const itemEntity = world.entities[item] as ItemEntity
    //     if (itemEntity) {
    //       itemEntity.components.position.setPosition({ x: 0, y: 0 })
    //       itemEntity.components.renderable.visible = true
    //     }
    //   }
    // },
    setActiveItemIndex: (index: number) => {
      inventory.data.activeItemIndex = index
    },
    includes: (item: ItemEntity) => { // TODO handle stackable items
      for (const ids of inventory.data.items) {
        if (ids && ids[0] === item.id) return true
      }
      return false
    }
  }
  return inventory
}

export const InventorySystem: SystemBuilder<"InventorySystem"> = {
  id: "InventorySystem",
  init: (world) => {
    const knownItems: Set<string> = new Set()

    return {
      id: "InventorySystem",
      query: ["position", "input", "actions", "renderable", "inventory", "team"],
      onTick: (entities: Entity<Position | Input | Actions | Renderable | Inventory | Team>[]) => {
        entities.forEach(entity => {
          const { inventory } = entity.components

          // build items
          if (inventory.itemBuilders.length) {
            inventory.itemBuilders.forEach((builder, index) => {
              const item = builder({ character: entity })

              inventory.data.items[index] = [item.id]
              world.addEntity(item)
              knownItems.add(item.id)
            })
            inventory.itemBuilders = []
          }

          // remove stale items
          for (let index = 0; index < inventory.data.items.length; index++) {
            const itemIds = inventory.data.items[index]
            if (!itemIds) continue

            const item = itemIds[0]
            const itemEntity = world.entities[item] as ItemEntity

            if (!itemEntity) {
              if (knownItems.has(item)) {
                inventory.data.items[index] = undefined
                knownItems.delete(item)
              }
              continue
            }

            // if (knownItems.has(item) && !itemEntity) {
            //   if (itemIds.length > 1) {
            //     itemIds.shift()
            //     continue
            //   } else {
            //     inventory.data.items[index] = undefined
            //     knownItems.delete(item)
            //     continue
            //   }
            // }

            if (itemEntity.components.input) {
              throw new Error("Item cannot have input component (breaks InputSystem)")
            }

            itemEntity.components.renderable.visible = false
            itemEntity.components.item.equipped = false
          }

          // update active item
          const activeItem = inventory.activeItem(world)
          if (activeItem) {
            activeItem.components.renderable.visible = true
            activeItem.components.item.equipped = true
          }
        })
      }
    }
  }
}
