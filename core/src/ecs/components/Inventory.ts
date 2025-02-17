import {
  Actions, Character, Component, Entity, Input, Position, Renderable,
  SystemBuilder, Team, keys, values, entries, ItemEntity
} from "@piggo-gg/core"

export type ItemBuilder = (_: { id?: string, character?: Character }) => ItemEntity

export type Inventory = Component<"inventory"> & {
  items: Record<string, ItemEntity[] | undefined>
  itemBuilders: ItemBuilder[]
  activeItemIndex: number
  activeItem: () => ItemEntity | null
  addItem: (item: ItemEntity) => void
  dropActiveItem: () => void
  setActiveItemIndex: (index: number) => void
  includes: (item: ItemEntity) => boolean
}

export const Inventory = (items: ((_: { id?: string, character: Character }) => ItemEntity)[] = []): Inventory => {
  const inventory: Inventory = {
    type: "inventory",
    items: { 1: undefined, 2: undefined, 3: undefined, 4: undefined, 5: undefined },
    itemBuilders: items,
    activeItemIndex: 0,
    activeItem: () => {
      return inventory.items[inventory.activeItemIndex]?.[0] ?? null
    },
    addItem: (item: ItemEntity) => {

      if (!inventory.includes(item)) {

        if (item.components.item.stackable) {
          for (let index of keys(inventory.items)) {
            if (inventory.items[index]?.[0].components.item.name === item.components.item.name) {
              inventory.items[index].push(item)
              return
            }
          }
        }

        for (let index of keys(inventory.items)) {
          if (!inventory.items[index]) {
            inventory.items[index] = [item]
            return
          }
        }
      }
    },
    dropActiveItem: () => {
      const slot = inventory.items[inventory.activeItemIndex]
      if (!slot) return
      if (slot.length > 1) {
        slot.shift()
        return
      }
      inventory.items[inventory.activeItemIndex] = undefined
    },
    setActiveItemIndex: (index: number) => {
      inventory.activeItemIndex = index
    },
    includes: (item: ItemEntity) => {
      return values(inventory.items).map(x => x?.[0]).includes(item)
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
              inventory.items[index] = [item]
            })
            inventory.itemBuilders = []
          }

          // reset state for all items
          entries(inventory.items).forEach(([index, slot]) => {
            if (!slot) return
            const item = slot[0]

            if (knownItems.has(item.id) && !world.entities[item.id]) {
              if (item.components.item.stackable) {
                slot.shift()
                if (slot.length === 0) inventory.items[index] = undefined
                return
              } else {
                inventory.items[index] = undefined
                knownItems.delete(item.id)
                return
              }
            }

            if (item.components.input) {
              throw new Error("Item cannot have input component (it breaks InputSystem)")
            }

            if (!world.entities[item.id]) world.addEntity(item)

            knownItems.add(item.id)

            item.components.renderable.visible = false
            item.components.item.equipped = false
          })

          // set state for active item
          const activeItem = inventory.activeItem()
          if (activeItem) {
            activeItem.components.renderable.visible = true
            activeItem.components.item.equipped = true
          }
        })
      }
    }
  }
}
