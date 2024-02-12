import { SystemBuilder } from "@piggo-legends/core";

export type Command = string;

// TODO localCommandBuffer is a hack
export var localCommandBuffer: Record<number, Record<string, Command[]>> = {};
export const addToLocalCommandBuffer = (tick: number, entityId: string, command: Command) => {
  if (!localCommandBuffer[tick]) {
    localCommandBuffer[tick] = {};
  }
  if (!localCommandBuffer[tick][entityId]) {
    localCommandBuffer[tick][entityId] = [];
  }
  if (!localCommandBuffer[tick][entityId].includes(command)) {
    localCommandBuffer[tick][entityId].push(command);
  }
}

export const CommandSystem: SystemBuilder = ({ game }) => {

  const onTick = () => {

    // console.log(`tick ${game.tick} buffer ${Object.keyslocalCommandBuffer}`)

    // add empty frames for the next 10 ticks
    for (let i = 0; i < 10; i++) {
      // console.log(localCommandBuffer[game.tick + i]);
      if (!localCommandBuffer[game.tick + i]) {
        localCommandBuffer[game.tick + i] = {};
      } else {
        // console.log(`saw ${JSON.stringify(localCommandBuffer[game.tick + i])}`)
      }
    }

    // for each buffered command, if it's scheduled for the current tick, execute it
    Object.keys(localCommandBuffer).forEach((tickNumber) => {
      const currentTick = Number(tickNumber);

      if ((game.tick - currentTick) > 30) {
        delete localCommandBuffer[currentTick];
        return;
      }

      if (currentTick === game.tick) {
        const commandsForEntities = localCommandBuffer[currentTick];

        Object.keys(commandsForEntities).forEach((entityId) => {
          const commands = commandsForEntities[entityId];
          if (commands) commands.forEach((command) => {

            const entity = game.entities[entityId];

            // entity not found
            if (!entity) {
              console.log(`集 ${entityId} not found`);
              return;
            }

            // entity has no actions
            const actions = entity.components.actions;
            if (!actions) {
              console.log(`集 ${entityId} has no actions`);
              return;
            }

            // find the action
            const action = actions.actionMap[command];

            // action not found
            if (!action) {
              console.log(`action ${command} not found`);
              return;
            }

            // execute the action
            // console.log(`集 ${command.entityId} command ${command.actionId} executed`);
            action(entity, game);
          });
        });
      }
    });
  }

  return {
    componentTypeQuery: [],
    onTick
  }
}
