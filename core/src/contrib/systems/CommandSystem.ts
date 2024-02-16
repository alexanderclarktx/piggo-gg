import { SystemBuilder } from "@piggo-legends/core";

export type Command = string;

// TODO localCommandBuffer is a hack
export var localCommandBuffer: Record<number, Record<string, Command[]>> = {};
export const addToLocalCommandBuffer = (tick: number, entityId: string, command: Command) => {
  tick += 1;

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

export const CommandSystem: SystemBuilder = ({ world }) => {

  const onTick = () => {

    // add empty frames for the next 10 ticks
    for (let i = 0; i < 10; i++) {
      // console.log(localCommandBuffer[world.tick + i]);
      if (!localCommandBuffer[world.tick + i]) {
        localCommandBuffer[world.tick + i] = {};
      } else {
        // console.log(`saw ${JSON.stringify(localCommandBuffer[world.tick + i])}`)
      }
    }

    // for each buffered command, if it's scheduled for the current tick, execute it
    Object.keys(localCommandBuffer).forEach((tickNumber) => {
      const currentTick = Number(tickNumber);

      if ((world.tick - currentTick) > 30) {
        delete localCommandBuffer[currentTick];
        return;
      }

      if (currentTick === world.tick) {
        const commandsForEntities = localCommandBuffer[currentTick];

        Object.keys(commandsForEntities).forEach((entityId) => {
          const commands = commandsForEntities[entityId];
          if (commands) commands.forEach((command) => {

            const entity = world.entities[entityId];

            // entity not found
            if (!entity) {
              // console.log(`集 ${entityId} not found`);
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
            // console.log(`集 ${entityId} command ${command} executed`);
            action(entity, world);
          });
        });
      }
    });
  }

  return {
    query: [],
    onTick
  }
}
