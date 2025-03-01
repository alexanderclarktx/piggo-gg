import { Entity, InvokedAction, SystemBuilder, entries, keys } from "@piggo-gg/core"

// TODO actions go on cooldown even if they "dont happen"
export const CooldownSystem: SystemBuilder<"CooldownSystem"> = {
  id: "CooldownSystem",
  init: (world) => {

    const cooldowns: Record<string, number> = {}

    const offCooldown = (entityId: string) => (invokedAction: InvokedAction) => {
      const key = `${entityId}|${invokedAction.actionId}`

      if (cooldowns[key]) return false

      const action = world.entities[entityId]?.components.actions?.actionMap[invokedAction.actionId]
      if (action && action.cooldown) cooldowns[key] = action.cooldown

      return true
    }

    return {
      id: "CooldownSystem",
      query: [],
      priority: 6,
      data: cooldowns,
      onTick: (_: Entity[]) => {

        keys(cooldowns).forEach((key) => {
          cooldowns[key]--

          if (cooldowns[key] <= 0) delete cooldowns[key]

          const [entityId, actionId] = key.split("|")
          const action = world.entities[entityId]?.components.actions?.actionMap[actionId]
          if (!action) return

          action.cdLeft = cooldowns[key] ?? undefined
        })

        const actions = world.actions.atTick(world.tick)
        if (!actions) return

        entries(actions).forEach(([entityId, invokedActions]) => {
          world.actions.set(world.tick, entityId, invokedActions.filter(offCooldown(entityId)))
        })
      }
    }
  }
}
