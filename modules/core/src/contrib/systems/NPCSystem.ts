import { Entity, SystemBuilder, Actions, NPC, localCommandBuffer, addToLocalCommandBuffer } from "@piggo-legends/core";

// NPCSystem invokes ai logic for NPCs
export const NPCSystem: SystemBuilder = ({ game }) => {

  const onTick = (entities: Entity<NPC | Actions>[]) => {
    entities.forEach((entity) => {
      const { npc, actions } = entity.components;
      const command = npc.props.onTick(entity, game);
      if (command && actions.actionMap[command]) {
        addToLocalCommandBuffer(game.tick, entity.id, command);
      }
    });
  }

  return {
    query: ["npc", "actions"],
    onTick
  }
}
