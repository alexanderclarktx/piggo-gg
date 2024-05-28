import { Action, Effect, XY } from "@piggo-gg/core";

// increases speed temporarily
export const Boost = Action<{ mouse: XY }>(({ entity }) => {
  if (!entity || !entity.components.position) return;

  const { effects } = entity.components;
  if (!effects) return;

  effects.addEffect("boost", BoostEffect(entity.components.position.data.speed));
}, 200);


const BoostEffect = (originalSpeed: number): Effect => ({
  duration: 60,
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
