import { Entity, SystemBuilder, entries } from "@piggo-gg/core";

export const EffectsSystem: SystemBuilder<"EffectsSystem"> = {
  id: "EffectsSystem",
  init: ({ world }) => ({
    id: "EffectsSystem",
    query: ["effects"],
    onTick: (entities: Entity[]) => {

      entities.forEach(entity => {
        const { effects } = entity.components;
        if (!effects) return;

        entries(effects.effects).forEach(([name, effect]) => {
          if (effect.cdLeft === undefined) {
            effect.cdLeft = effect.duration;
            effect.onStart(entity, world);
          } else {
            effect.cdLeft -= 1;
            if (effect.cdLeft <= 0) {
              effect.onEnd(entity, world);
              delete effects.effects[name];
            } else if (effect.onTick) {
              effect.onTick(entity, world);
            }
          }
        });
      });
    }
  })
}
