import { Action, Entity, Sounds, ZomiAttackSounds, playSound, randomChoice } from "@piggo-gg/core";

export const ZomiAttack = (damage: number, cooldown: number) => Action<{ target: Entity }>(({ entity, params, world }) => {
  const { target } = params;
  const { health } = target.components;

  if (health) health.data.health -= damage;

  entity?.components.position?.setHeading({ x: NaN, y: NaN });

  playSound(world.client?.sounds[randomChoice(["attack1", "attack2", "attack3", "attack4"]) as ZomiAttackSounds]);
}, cooldown)
