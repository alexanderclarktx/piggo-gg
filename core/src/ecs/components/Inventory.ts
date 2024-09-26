import { Actions, Component, Entity, Name, SystemBuilder, random, round } from "@piggo-gg/core";

export type Item = Entity<Name | Actions>

export const Item = (name: string, components: Entity<Actions>["components"]) => Entity<Name | Actions>({
  id: `${round(random() * 1000)}-${name}`,
  components: {
    ...components,
    name: Name(name),
  }
})

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
  return inventory;
}

export const InventorySystem: SystemBuilder<"InventorySystem"> = {
  id: "InventorySystem",
  init: (world) => ({
    id: "InventorySystem",
    query: ["inventory"],
    onTick: (entities: Entity<Inventory>[]) => {
      entities.forEach(entity => {
        const { inventory } = entity.components;

        inventory.items.forEach(item => {
          if (!world.entities[item.id]) {
            world.addEntity(item);
          }
        })
      })
    }
  })
}
