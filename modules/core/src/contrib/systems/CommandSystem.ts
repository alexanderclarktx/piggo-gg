import { SystemBuilder } from "@piggo-legends/core";

export type Command = {
  tick: number
  entityId: string
  actionId: string
}

// TODO localCommandBuffer is a hack
export var localCommandBuffer: Record<number, Record<string, Command>> = {};

export const CommandSystem: SystemBuilder = ({ game }) => {

  const onTick = () => {

    // console.log(`tick ${game.tick} buffer ${Object.keyslocalCommandBuffer}`)

    // add empty frames for the next 10 ticks
    for (let i = 0; i < 10; i++) {
      // console.log(localCommandBuffer[game.tick + i]);
      if (!localCommandBuffer[game.tick + i]) {
        // console.log(`clearing ${localCommandBuffer[game.tick + i]}`);
        localCommandBuffer[game.tick + i] = {};
      } else {
        // console.log(`saw ${localCommandBuffer[game.tick + i].size}`)
      }
    }

    // for each buffered command, if it's scheduled for the current tick, execute it
    Object.keys(localCommandBuffer).forEach((tickNumber) => {
      const currentTick = Number(tickNumber);

      if ((game.tick - currentTick) > 10) {
        delete localCommandBuffer[Number(tickNumber)];
        return;
      }

      // if (command.tick < game.tick) {
      //   console.log(`集 ${command.entityId} command ${command.actionId} too old`);
      //   console.log(`${command.tick} < ${game.tick}`);

      //   // TODO rollback
      //   localCommandBuffer = localCommandBuffer.filter((c) => c !== command);
      // }

      if (currentTick === game.tick) {
        const commandsForEntities = localCommandBuffer[currentTick];

        Object.keys(commandsForEntities).forEach((entityId) => {
          const command = commandsForEntities[entityId];
          const entity = game.entities[entityId];

          // entity not found
          if (!entity) {
            console.log(`集 ${command.entityId} not found`);
            return;
          }

          // entity has no actions
          const actions = entity.components.actions;
          if (!actions) {
            console.log(`集 ${command.entityId} has no actions`);
            return;
          }

          // find the action
          const action = actions.actionMap[command.actionId];

          // action not found
          if (!action) {
            console.log(`action ${command.actionId} not found`);
            return;
          }

          // execute the action
          // console.log(`集 ${command.entityId} command ${command.actionId} executed`);
          action(entity, game);
        });
      }
    });
  }

  return {
    componentTypeQuery: [],
    onTick
  }
}
