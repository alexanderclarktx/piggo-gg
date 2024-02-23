import { SystemBuilder } from "@piggo-legends/core";

export type Command = string;

export const CommandSystem: SystemBuilder = ({ world, clientPlayerId }) => {

  const onTick = () => {

    // add empty frames for the next 10 ticks
    for (let i = 0; i < 10; i++) {
      if (!world.localCommandBuffer[world.tick + i]) world.localCommandBuffer[world.tick + i] = {};
    }

    // for each buffered command, if it's scheduled for the current tick, execute it
    Object.keys(world.localCommandBuffer).forEach((tickNumber) => {
      const currentTick = Number(tickNumber);

      if (currentTick === world.tick) {
        const commandsForEntities = world.localCommandBuffer[currentTick];

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
            action(entity, world, clientPlayerId);
          });
        });
      }
    });
  }

  return {
    id: "CommandSystem",
    query: [],
    onTick
  }
}
