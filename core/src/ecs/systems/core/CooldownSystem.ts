import { Entity, InvokedAction, SystemBuilder, entries, keys } from "@piggo-gg/core";

export const CooldownSystem: SystemBuilder<"CooldownSystem"> = {
  id: "CooldownSystem",
  init: ({ world }) => {

    const cooldowns: Record<string, number> = {};

    const offCooldown = (entityId: string) => (invokedAction: InvokedAction) => {
      const key = `${entityId}|${invokedAction.action}`;

      if (cooldowns[key]) return false;

      const action = world.entities[entityId]?.components.actions?.actionMap[invokedAction.action];
      if (action && action.cooldown) cooldowns[key] = action.cooldown;

      return true;
    }

    return {
      id: "CooldownSystem",
      query: [],
      data: cooldowns,
      onTick: (_: Entity[]) => {

        keys(cooldowns).forEach((key) => {
          cooldowns[key]--;

          if (cooldowns[key] <= 0) delete cooldowns[key];

          const [entityId, actionId] = key.split("|");
          const action = world.entities[entityId]?.components.actions?.actionMap[actionId]
          if (!action) return;
          action.cdLeft = cooldowns[key] ?? undefined;
        });

        const actions = world.actionBuffer.atTick(world.tick);
        if (!actions) return;

        entries(actions).forEach(([entityId, invokedActions]) => {
          world.actionBuffer.set(world.tick, entityId, invokedActions.filter(offCooldown(entityId)));
        });
      }
    }
  }
}
