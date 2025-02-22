import { Entity, NPC, Position, SystemBuilder } from "@piggo-gg/core"

// NPCSystem invokes ai logic for NPCs
export const NPCSystem: SystemBuilder<"NPCSystem"> = {
  id: "NPCSystem",
  init: (world) => ({
    id: "NPCSystem",
    query: ["npc", "position"],
    onTick: (entities: Entity<NPC | Position>[]) => {
      entities.forEach((entity) => {
        const action = entity.components.npc.behavior(entity, world)
        if (action) {
          world.actions.push(world.tick, entity.id, action)
        }
      })
    }
  })
}
