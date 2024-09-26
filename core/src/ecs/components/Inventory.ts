import { Actions, Component, Entity, Input, Name, SystemBuilder, random, round } from "@piggo-gg/core"

export type Item = Entity<Name | Input | Actions>

export type Inventory = Component<"inventory"> & {
  items: Item[]
  activeItem: Item | null
}

export const Inventory = (items: Item[]): Inventory => {
  const inventory: Inventory = {
    type: "inventory",
    items,
    activeItem: items[0] ?? null
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

            const { name } = item.components.name.data

            if (!items[item.id]) {
              const newId = `item-${round(random() * 1000)}-${name}`

              // update the entity id
              item.id = newId

              // add it to the dict
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
