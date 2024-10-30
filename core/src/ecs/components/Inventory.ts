import {
  Actions, Character, Component, Entity, Input, Position, Renderable,
  SystemBuilder, Team, keys, values, entries, ItemEntity
} from "@piggo-gg/core"

export type ItemBuilder = (character: Character) => ItemEntity

type ItemSlot = {
  item: ItemEntity
  count: number
}

export type Inventory = Component<"inventory"> & {
  items: Record<string, ItemSlot | undefined>
  itemBuilders: ItemBuilder[]
  activeItemIndex: number
  activeItem: () => ItemEntity | null
  addItem: (item: ItemEntity) => void
  dropActiveItem: () => void
  setActiveItemIndex: (index: number) => void
  includes: (item: ItemEntity) => boolean
}

export const Inventory = (items: ((character: Character) => ItemEntity)[]): Inventory => {
  const inventory: Inventory = {
    type: "inventory",
    items: { 1: undefined, 2: undefined, 3: undefined, 4: undefined, 5: undefined },
    itemBuilders: items,
    activeItemIndex: 0,
    activeItem: () => inventory.items[inventory.activeItemIndex]?.item ?? null,
    addItem: (item: ItemEntity) => {

      if (!inventory.includes(item)) {
        let inserted = false

        keys(inventory.items).forEach(index => {
          if (!inventory.items[index] && !inserted) {
            inventory.items[index] = { item, count: 1 }
            inserted = true
            return
          }
        })
      }
    },
    dropActiveItem: () => {
      inventory.items[inventory.activeItemIndex] = undefined
    },
    setActiveItemIndex: (index: number) => {
      inventory.activeItemIndex = index
    },
    includes: (item: ItemEntity) => {
      return values(inventory.items).map(x => x?.item.id).includes(item.id)
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
              const item = builder(entity)
              inventory.items[index] = { item, count: 1 }
            })
            inventory.itemBuilders = []
          }

          // reset state for all items
          entries(inventory.items).forEach(([index, slot]) => {
            if (!slot) return
            const { item } = slot

            if (knownItems.has(item.id) && !world.entities[item.id]) {
              inventory.items[index] = undefined
              knownItems.delete(item.id)
              return
            }

            if (item.components.input) {
              throw new Error("Item cannot have input component (it breaks InputSystem)")
            }

            if (!world.entities[item.id]) world.addEntity(item)

            knownItems.add(item.id)

            item.components.renderable.visible = false
            item.components.equip.equipped = false
          })

          // set state for active item
          const activeItem = inventory.activeItem()
          if (activeItem) {
            activeItem.components.renderable.visible = true
            activeItem.components.equip.equipped = true
          }
        })
      }
    }
  }
}
