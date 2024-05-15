import { Controlling, Entity, Player, SystemBuilder } from "@piggo-gg/core";

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
          actions.forEach((actions) => {
            const command = world.commands[actions.action];

            let player: Entity<Player | Controlling> | undefined = undefined;
            if (actions.playerId) player = world.entities[actions.playerId] as Entity<Player | Controlling>;

            if (command) command.invoke({ params: actions.params ?? {}, world, player });
          });
        }

        // handle actions
        if (actions) actions.forEach((invokedAction) => {
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
          const action = actions.actionMap[invokedAction.action];

          // action not found
          if (!action) {
            console.log(`action ${invokedAction} not found`);
            return;
          }

          // execute the action
          // TODO shouldn't always be client player
          let player: Entity<Player | Controlling> | undefined = undefined;
          if (invokedAction.playerId) player = world.entities[invokedAction.playerId] as Entity<Player | Controlling>;
          action.invoke({ params: invokedAction.params ?? {}, entity, world, player });
        });
      });
    }
  })
}
