import { Entity, NPC, SystemBuilder } from "@piggo-gg/core";

// NPCSystem invokes ai logic for NPCs
export const NPCSystem: SystemBuilder<"NPCSystem"> = ({
  id: "NPCSystem",
  init: ({ world }) => {
    const onTick = (entities: Entity<NPC>[]) => {
      entities.forEach((entity) => {
        const action = entity.components.npc.props.onTick(entity, world);
        if (action) {
          world.actionBuffer.push(world.tick, entity.id, action);
        }
      });
    }

    return {
      id: "NPCSystem",
      query: ["npc"],
      onTick
    }
  }
});
