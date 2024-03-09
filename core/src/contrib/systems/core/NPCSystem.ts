import { Entity, NPC, SystemBuilder } from "@piggo-gg/core";

// NPCSystem invokes ai logic for NPCs
export const NPCSystem: SystemBuilder<"NPCSystem"> = ({
  id: "NPCSystem",
  init: ({ world }) => {
    const onTick = (entities: Entity<NPC>[]) => {
      entities.forEach((entity) => {
        const { npc, actions } = entity.components;

        const action = npc.props.onTick(entity, world);

        if (action && actions?.actionMap[action]) {
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
