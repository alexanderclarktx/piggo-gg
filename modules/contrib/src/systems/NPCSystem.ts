import { Actions, NPC, localCommandBuffer } from "@piggo-legends/contrib";
import { Entity, SystemBuilder } from "@piggo-legends/core";

// NPCSystem invokes ai logic for NPCs
export const NPCSystem: SystemBuilder = ({ game }) => {

  const onTick = (entities: Entity[]) => {
    entities.forEach((entity) => {
      const { npc, actions } = entity.components as { npc: NPC, actions: Actions };
      const command = npc.props.onTick(entity, game);
      if (command && actions.actionMap[command]) {
        // console.log(`NPC ${entity.id} command ${command}`);
        localCommandBuffer.push({
          tick: game.tick + 1,
          entityId: entity.id,
          actionId: command
        });
      }
    });
  }

  return {
    componentTypeQuery: ["npc", "actions"],
    onTick
  }
}
