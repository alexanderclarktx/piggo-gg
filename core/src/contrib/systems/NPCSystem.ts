import { Actions, Entity, NPC, SystemBuilder, addToLocalCommandBuffer } from "@piggo-legends/core";

// NPCSystem invokes ai logic for NPCs
export const NPCSystem: SystemBuilder = ({ world }) => {

  const onTick = (entities: Entity<NPC | Actions>[]) => {
    entities.forEach((entity) => {
      const { npc, actions } = entity.components;
      const command = npc.props.onTick(entity, world);
      if (command && actions.actionMap[command]) {
        addToLocalCommandBuffer(world.tick, entity.id, command);
      }
    });
  }

  return {
    query: ["npc", "actions"],
    onTick
  }
}
