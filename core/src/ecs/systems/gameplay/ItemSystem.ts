import { Entity, Inventory, Position, Renderable, SystemBuilder } from "@piggo-gg/core"

export const ItemSystem: SystemBuilder<"item"> = ({
  id: "item",
  init: (world) => {
    return {
      id: "item",
      query: ["inventory", "position", "renderable"],
      onTick: (entities: Entity<Inventory | Position | Renderable>[]) => {
        entities.forEach((entity) => {

          const { inventory } = entity.components

          inventory.items.forEach((item) => {
            item.components.renderable.visible = false
          })

          const activeItem = inventory.activeItem()

          if (activeItem) {
            activeItem.components.renderable.visible = true
          }
        })
      }
    }
  }
})
