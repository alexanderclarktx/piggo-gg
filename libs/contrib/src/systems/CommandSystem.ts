import { Entity, Game, System } from "@piggo-legends/core";
import { Actions } from "@piggo-legends/contrib";

export type Command = {
  tick: number
  entityId: string
  actionId: string
}

export var localCommandBuffer: Command[] = [];

export const CommandSystem = (game: Game): System => {

  const onTick = (_: Entity[]) => {

    // for each buffered command, if it's scheduled for the current tick, execute it
    localCommandBuffer.forEach((command) => {
      if (command.tick < game.tick) {
        console.log(`集 ${command.entityId} command ${command.actionId} too old`);

        // TODO rollback
        localCommandBuffer = localCommandBuffer.filter((c) => c !== command);
      }
      if (command.tick === game.tick) {        
        const entity = game.entities[command.entityId];
        if (!entity) { // entity not found
          console.log(`集 ${command.entityId} not found`);
          return;
        }

        const actions = entity.components.actions as Actions;
        if (!actions) { // entity has no actions
          console.log(`集 ${command.entityId} has no actions`);
          return;
        }

        // execute the action
        const action = actions.actionMap[command.actionId];

        if (!action) { // action not found
          console.log(`action ${command.actionId} not found`);
          return;
        }
        action(entity, game);
        // console.log(`${command.entityId} command ${command.actionId}`);

        // remove the command from the buffer
        localCommandBuffer = localCommandBuffer.filter((c) => c !== command);
      }
    });
  }

  return {
    componentTypeQuery: [],
    onTick
  }
}
