import { Entity, SystemBuilder, Actions, NPC, localCommandBuffer } from "@piggo-legends/core";

// NPCSystem invokes ai logic for NPCs
export const NPCSystem: SystemBuilder = ({ game }) => {

  const onTick = (entities: Entity<NPC | Actions>[]) => {
    entities.forEach((entity) => {
      const { npc, actions } = entity.components;
      const command = npc.props.onTick(entity, game);
      if (command && actions.actionMap[command]) {
        // console.log(`NPC ${entity.id} command ${command}`);
        localCommandBuffer[game.tick + 1][entity.id] = {
          tick: game.tick + 1,
          entityId: entity.id,
          actionId: command
        };
      }
    });
  }

  return {
    componentTypeQuery: ["npc", "actions"],
    onTick
  }
}
