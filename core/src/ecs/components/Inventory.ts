import {
  Actions, Character, Component, Entity, Input, Position,
  Renderable, SystemBuilder, Team, ItemEntity
} from "@piggo-gg/core"

export type ItemBuilder = (_: { id?: string, character?: Character }) => ItemEntity

export type Inventory = Component<"inventory", {
  items: (string | undefined)[]
  activeItemIndex: number
}> & {
  items: (ItemEntity[] | undefined)[]
  itemBuilders: ItemBuilder[]
  activeItem: () => ItemEntity | null
  addItem: (item: ItemEntity) => void
  includes: (item: ItemEntity) => boolean
  dropActiveItem: () => void
  setActiveItemIndex: (index: number) => void
}

export const Inventory = (items: ItemBuilder[] = []): Inventory => {
  const inventory: Inventory = {
    data: {
      activeItemIndex: 0,
      items: [undefined, undefined, undefined, undefined, undefined]
    },
    type: "inventory",
    items: [undefined, undefined, undefined, undefined, undefined],
    itemBuilders: items,

    activeItem: () => {
      return inventory.items[inventory.data.activeItemIndex]?.[0] ?? null
    },
    addItem: (item: ItemEntity) => {
      if (inventory.includes(item)) return

      if (item.components.item.stackable) {
        // check if we already have this item
        for (const slot of inventory.items) {
          if (slot && slot[0].components.item.name === item.components.item.name) {
            slot.push(item)
            return
          }
        }
      }

      for (let i = 0; i < inventory.items.length; i++) {
        const slot = inventory.items[i]
        if (slot === undefined) {
          inventory.items[i] = [item]
          return
        }
      }
    },
    dropActiveItem: () => {
      const slot = inventory.items[inventory.data.activeItemIndex]
      if (!slot) return
      if (slot.length > 1) {
        slot.shift()
        return
      }
      inventory.items[inventory.data.activeItemIndex] = undefined
    },
    setActiveItemIndex: (index: number) => {
      inventory.data.activeItemIndex = index
    },
    includes: (item: ItemEntity) => { // TODO handle stackable items
      for (const slot of inventory.items) {
        if (slot && slot[0].id === item.id) return true
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
              inventory.items[index] = [item]
            })
            inventory.itemBuilders = []
          }

          // update networked items
          inventory.data.items = inventory.items.map(slot => {
            if (!slot) return undefined
            return slot[0].id
          })

          // remove stale items
          for (let index = 0; index < inventory.items.length; index++) {
            const slot = inventory.items[index]
            if (!slot) continue

            const item = slot[0]

            if (knownItems.has(item.id) && !world.entities[item.id]) {
              if (item.components.item.stackable) {
                slot.shift()
                if (slot.length === 0) inventory.items[index] = undefined
                continue
              } else {
                inventory.items[index] = undefined
                knownItems.delete(item.id)
                continue
              }
            }

            if (item.components.input) {
              throw new Error("Item cannot have input component (it breaks InputSystem)")
            }

            if (!world.entities[item.id]) world.addEntity(item)

            knownItems.add(item.id)

            item.components.renderable.visible = false
            item.components.item.equipped = false
          }

          // update active item
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
