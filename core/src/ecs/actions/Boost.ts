import { Action, Effect, XY } from "@piggo-gg/core";

// increase player's speed for 2 seconds
export const Boost = Action<{ mouse: XY }>(({ entity }) => {
  if (!entity || !entity.components.position) return;

  const { effects } = entity.components;
  if (!effects) return;

  effects.addEffect("boost", BoostEffect(entity.components.position.data.speed));
}, 120);


const BoostEffect = (originalSpeed: number): Effect => ({
  duration: 40,
  onStart: (entity) => {
    const { position } = entity.components;
    if (!position) return;
    position.setSpeed(250);
  },
  onEnd: (entity) => {
    const { position } = entity.components;
    if (!position) return;
    position.setSpeed(originalSpeed);
  }
})
