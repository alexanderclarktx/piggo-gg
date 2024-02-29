import { SystemBuilder } from "@piggo-legends/core";

export const ActionSystem: SystemBuilder = ({ world, clientPlayerId }) => {

  const onTick = () => {

    // add empty frames for the next 10 ticks
    for (let i = 0; i < 10; i++) {
      if (!world.localActionBuffer[world.tick + i]) world.localActionBuffer[world.tick + i] = {};
    }

    // for each buffered action, if it's scheduled for the current tick, execute it
    Object.keys(world.localActionBuffer).forEach((tickNumber) => {
      const currentTick = Number(tickNumber);

      if (currentTick === world.tick) {
        const actionsForEntities = world.localActionBuffer[currentTick];

        Object.keys(actionsForEntities).forEach((entityId) => {
          const actions = actionsForEntities[entityId];
          if (actions) actions.forEach((actionKey) => {

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
            const action = actions.actionMap[actionKey];

            // action not found
            if (!action) {
              console.log(`action ${actionKey} not found`);
              return;
            }

            // execute the action
            // console.log(`集 ${entityId} action ${actionKey} executed`);
            action.apply(entity, world, clientPlayerId);
          });
        });
      }
    });
  }

  return {
    id: "ActionSystem",
    query: [],
    onTick
  }
}
