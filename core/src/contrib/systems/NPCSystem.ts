import { Entity, NPC, SystemBuilder } from "@piggo-legends/core";

// NPCSystem invokes ai logic for NPCs
export const NPCSystem: SystemBuilder = ({ world }) => {

  const onTick = (entities: Entity<NPC>[]) => {
    entities.forEach((entity) => {
      const { npc, actions } = entity.components;

      const action = npc.props.onTick(entity, world);

      if (action && actions?.actionMap[action]) {
        world.actionBuffer.addAction(world.tick, entity.id, action);
      }
    });
  }

  return {
    id: "NPCSystem",
    query: ["npc"],
    onTick
  }
}
