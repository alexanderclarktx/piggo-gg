import { SystemBuilder } from "@piggo-gg/core";

export const ActionSystem: SystemBuilder = ({ world, clientPlayerId }) => {

  const onTick = () => {

    const actionsAtTick = world.actionBuffer.atTick(world.tick);

    if (actionsAtTick) {
      Object.keys(actionsAtTick).forEach((entityId) => {
        const actions = actionsAtTick[entityId];
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
          const action = actions.actionMap[actionKey];

          // action not found
          if (!action) {
            console.log(`action ${actionKey} not found`);
            return;
          }

          // execute the action
          // console.log(`集 ${entityId} action ${actionKey} executed ${world.tick}`);
          action.apply(entity, world, clientPlayerId);
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
