import { Actions, Component, Effects, Position, Entity, Input, Name, Renderable, SystemBuilder, randomInt, Character } from "@piggo-gg/core"

export type Item = Entity<Name | Position | Actions | Effects | Renderable>
export type ItemBuilder = (character: Character) => Item

export type Inventory = Component<"inventory"> & {
  items: Item[]
  itemBuilders: ItemBuilder[]
  activeItemIndex: number
  activeItem: () => Item | null
  setActiveItemIndex: (index: number) => void
}

export const Inventory = (items: ((character: Character) => Item)[]): Inventory => {
  const inventory: Inventory = {
    type: "inventory",
    items: [],
    itemBuilders: items,
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
  init: (world) => ({
    id: "InventorySystem",
    query: ["position", "input", "actions", "renderable", "inventory"],
    onTick: (entities: Entity<Position | Input | Actions | Renderable | Inventory>[]) => {
      entities.forEach(entity => {
        const { inventory } = entity.components

        if (inventory.itemBuilders.length) {
          inventory.items = inventory.itemBuilders.map(builder => builder(entity))
          inventory.itemBuilders = []
        }

        inventory.items.forEach(item => {

          // TODO this should be typed
          if (item.components.input) {
            throw new Error("Item cannot have input component (it breaks InputSystem)")
          }

          if (!world.entities[item.id]) world.addEntity(item)
        })
      })
    }
  })
}
