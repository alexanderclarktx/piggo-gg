import { Entity, NPC, SystemBuilder } from "@piggo-legends/core";

// NPCSystem invokes ai logic for NPCs
export const NPCSystem: SystemBuilder = ({ world }) => {

  const onTick = (entities: Entity<NPC>[]) => {
    entities.forEach((entity) => {
      const { npc, actions } = entity.components;

      const command = npc.props.onTick(entity, world);

      if (command && actions?.actionMap[command]) {
        world.addToLocalCommandBuffer(world.tick, entity.id, command);
      }
    });
  }

  return {
    id: "NPCSystem",
    query: ["npc"],
    onTick
  }
}
