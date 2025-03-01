import { Controlling, Entity, SystemBuilder } from "@piggo-gg/core"

export const ControlSystem: SystemBuilder = ({
  id: "ControlSystem",
  init: (world) => ({
    id: "ControlSystem",
    query: ["controlling"],
    priority: 2,
    onTick: (entities: Entity<Controlling>[]) => {
      entities.forEach((entity) => {
        const character = entity.components.controlling.getCharacter(world)

        if (!character) {
          entity.components.controlling.data.entityId = ""
        }
      })
    }
  })
})
