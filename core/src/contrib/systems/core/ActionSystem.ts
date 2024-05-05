import { SystemBuilder } from "@piggo-gg/core";

export const ActionSystem: SystemBuilder<"ActionSystem"> = {
  id: "ActionSystem",
  init: ({ world }) => ({
    id: "ActionSystem",
    query: [],
    onTick: () => {
      const actionsAtTick = world.actionBuffer.atTick(world.tick);
      if (!actionsAtTick) return;

      Object.entries(actionsAtTick).forEach(([entityId, actions]) => {

        // handle commands
        if (entityId === "world") {
          const command = world.commands[actions[0].action]
          if (command) command.invoke({ params: actions[0].params ?? {}, world, player: world.client?.playerId });
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
          action.invoke({ params: actionKey.params ?? {}, entity, world, player: world.client?.playerId });
        });
      });
    }
  })
}
