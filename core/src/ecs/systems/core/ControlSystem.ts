import { Controlling, Entity, SystemBuilder } from "@piggo-gg/core";

export const ControlSystem: SystemBuilder = ({
  id: "ControlSystem",
  init: (world) => ({
    id: "ControlSystem",
    query: ["controlling"],
    onTick: (entities: Entity<Controlling>[]) => {
      entities.forEach((entity) => {
        const controlledEntity = world.entities[entity.components.controlling.data.entityId];

        if (!controlledEntity) {
          entity.components.controlling.data.entityId = "";
        }
      });
    }
  })
})
