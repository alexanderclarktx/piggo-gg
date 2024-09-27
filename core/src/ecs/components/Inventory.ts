import { Actions, Component, Effects, Entity, Input, Name, SystemBuilder, randomInt } from "@piggo-gg/core"

export type Item = Entity<Name | Input | Actions | Effects>

export type Inventory = Component<"inventory"> & {
  items: Item[]
  activeItemIndex: number
  activeItem: () => Item | null
  setActiveItemIndex: (index: number) => void
}

export const Inventory = (items: Item[]): Inventory => {
  const inventory: Inventory = {
    type: "inventory",
    items,
    activeItemIndex: 0,
    activeItem: () => inventory.items[inventory.activeItemIndex] ?? null,
    setActiveItemIndex: (index: number) => {
      inventory.activeItemIndex = index
    }
  }
  return inventory
}

export const InventorySystem: SystemBuilder<"InventorySystem"> = {
  id: "InventorySystem",
  init: (world) => {
    const items: Record<string, Item> = {}

    return {
      id: "InventorySystem",
      query: ["inventory"],
      onTick: (entities: Entity<Inventory>[]) => {
        entities.forEach(entity => {
          const { inventory } = entity.components

          inventory.items.forEach(item => {
            if (!items[item.id]) {
              const newId = `item-${randomInt(1000)}-${item.components.name.data.name}`

              // update the entity id
              item.id = newId

              // save it
              items[newId] = item

              // add it to the world
              world.addEntity(item)
            }
          })
        })
      }
    }
  }
}
