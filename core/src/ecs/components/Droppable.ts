import { Component, Entity, SystemBuilder } from "@piggo-gg/core";

export type Droppable = Component<"droppable"> & {
  dropped: boolean
}

export const Droppable = (dropped: boolean = false): Droppable => ({
  type: "droppable",
  dropped
})

export const DroppableSystem: SystemBuilder<"DroppableSystem"> = {
  id: "DroppableSystem",
  init: () => ({
    id: "DroppableSystem",
    query: ["droppable"],
    onTick: (entities: Entity<Droppable>[]) => {
      entities.forEach(entity => {
        const { droppable, position, collider, renderable } = entity.components

        if (position) position.active = droppable.dropped
        if (collider) collider.active = droppable.dropped
        if (!droppable.dropped && renderable) renderable.cleanup()
      })
    }
  })
}
