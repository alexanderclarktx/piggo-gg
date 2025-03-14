import { Player, SystemBuilder, entries, keys, stringify } from "@piggo-gg/core"

export const ActionSystem: SystemBuilder<"ActionSystem"> = {
  id: "ActionSystem",
  init: (world) => ({
    id: "ActionSystem",
    query: [],
    priority: 8,
    onTick: () => {
      const actionsAtTick = world.actions.atTick(world.tick)
      if (!actionsAtTick) return

      entries(actionsAtTick).forEach(([entityId, actions]) => {

        // handle commands
        if (entityId === "world") {
          actions.forEach((invokedAction) => {
            const command = world.commands[invokedAction.actionId]

            const player = invokedAction.playerId ? world.entities[invokedAction.playerId] as Player : undefined
            if (command) command.invoke({ params: invokedAction.params ?? {}, world, player })
          })
          return
        }

        // handle actions
        if (actions) actions.forEach((invokedAction) => {
          const entity = world.entity(entityId)

          // entity not found
          if (!entity) {
            console.log(`entity ${entityId} not found for action ${invokedAction.actionId}`)
            return
          }

          // entity has no actions
          const actions = entity.components.actions
          if (!actions) {
            console.log(`${entityId} has no actions`)
            return
          }

          // find the action
          const action = actions.actionMap[invokedAction.actionId]

          // action not found
          if (!action) {
            console.log(`action ${stringify(invokedAction)} not found in actionMap ${keys(actions.actionMap)}`)
            return
          }

          // execute the action
          const player = invokedAction.playerId ? world.entities[invokedAction.playerId] as Player : undefined
          action.invoke({ params: invokedAction.params ?? {}, entity, world, player })
        })
      })
    }
  })
}
