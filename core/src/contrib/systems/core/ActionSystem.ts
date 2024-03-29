import { SystemBuilder } from "@piggo-gg/core";

export const ActionSystem = SystemBuilder({
  id: "ActionSystem",
  init: ({ world, clientPlayerId }) => {

    const onTick = () => {

      const actionsAtTick = world.actionBuffer.atTick(world.tick);
      if (actionsAtTick) {
        Object.entries(actionsAtTick).forEach(([entityId, actions]) => {

          // handle commands
          if (entityId === "world") {
            const command = world.commands[actions[0].action]
            if (command) command.apply({ params: actions[0].params, world, player: clientPlayerId });
          }

          // handle actions
          if (actions) actions.forEach((actionKey) => {
            const entity = world.entities[entityId];

            // entity not found
            if (!entity) return;

            // entity has no actions
            const actions = entity.components.actions;
            if (!actions) {
              console.log(`集 ${entityId} has no actions`);
              return;
            }

            // find the action
            const action = actions.actionMap[actionKey.action];

            // action not found
            if (!action) {
              console.log(`action ${actionKey} not found`);
              return;
            }

            // execute the action
            // console.log(`集 ${entityId} action=${JSON.stringify(actionKey)}}`);
            action.apply({ params: actionKey.params, entity, world, player: clientPlayerId });
          });
        });
      }
    }

    return {
      id: "ActionSystem",
      query: [],
      onTick
    }
  }
});
