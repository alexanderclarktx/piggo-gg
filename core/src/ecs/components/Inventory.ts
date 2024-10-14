import {
  Actions, Character, Component, Droppable, Effects, Entity, Input,
  Name, Position, Renderable, SystemBuilder, Team
} from "@piggo-gg/core"

export type Item = Entity<Name | Position | Actions | Effects | Renderable | Droppable>
export const Item = Entity<Name | Position | Actions | Effects | Renderable | Droppable>

export type ItemBuilder = (character: Character) => Item

export type Inventory = Component<"inventory"> & {
  items: (Item | undefined)[]
  itemBuilders: ItemBuilder[]
  activeItemIndex: number
  activeItem: () => Item | null
  addItem: (item: Item) => void
  dropActiveItem: () => void
  setActiveItemIndex: (index: number) => void
}

export const Inventory = (items: ((character: Character) => Item)[]): Inventory => {
  const inventory: Inventory = {
    type: "inventory",
    items: [],
    itemBuilders: items,
    activeItemIndex: 0,
    activeItem: () => inventory.items[inventory.activeItemIndex] ?? null,
    addItem: (item: Item) => {
      if (!inventory.items.map(x => x?.id).includes(item.id)) {
        let inserted = false

        inventory.items.forEach((slot, index) => {
          console.log("slot", slot, index)
          if (!slot && !inserted) {
            inventory.items[index] = item
            inserted = true
            return
          }
        })
        if (!inserted) inventory.items.push(item)
      }
    },
    dropActiveItem: () => {
      inventory.items[inventory.activeItemIndex] = undefined
    },
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
    query: ["position", "input", "actions", "renderable", "inventory", "team"],
    onTick: (entities: Entity<Position | Input | Actions | Renderable | Inventory | Team>[]) => {
      entities.forEach(entity => {
        const { inventory } = entity.components

        if (inventory.itemBuilders.length) {
          inventory.items = inventory.itemBuilders.map(builder => builder(entity))
          inventory.itemBuilders = []
        }

        inventory.items.forEach(item => {

          if (!item) return

          // TODO this should be typed
          if (item.components.input) {
            throw new Error("Item cannot have input component (it breaks InputSystem)")
          }

          if (!world.entities[item.id]) world.addEntity(item)

          item.components.renderable.visible = false

          const activeItem = inventory.activeItem()

          if (activeItem) {
            activeItem.components.renderable.visible = true
          }
        })
      })
    }
  })
}
