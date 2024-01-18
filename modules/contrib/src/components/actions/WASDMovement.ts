import { ActionMap, AnimationKeys, Character, Position } from "@piggo-legends/contrib"
import { Entity } from "@piggo-legends/core";

const speed = 2.5;
const speedDiagonal = speed / Math.sqrt(2);
const speedHorizontal = speed / 2;

export type WASDMovementCommands = "" | "up" | "down" | "left" | "right" | "upleft" | "upright" | "downleft" | "downright";

export const WASDMovementPhysics: ActionMap<WASDMovementCommands> = {
  "up": (entity: Entity<Position>) => setAV(entity, "u", { x: -speedDiagonal, y: -speedDiagonal }),
  "down": (entity: Entity<Position>) => setAV(entity, "d", { x: speedDiagonal, y: speedDiagonal }),
  "left": (entity: Entity<Position>) => setAV(entity, "l", { x: -speedHorizontal, y: speedHorizontal }),
  "right": (entity: Entity<Position>) => setAV(entity, "r", { x: speedHorizontal, y: -speedHorizontal }),
  "upleft": (entity: Entity<Position>) => setAV(entity, "ul", { x: -speed, y: 0 }),
  "upright": (entity: Entity<Position>) => setAV(entity, "ur", { x: 0, y: -speed }),
  "downleft": (entity: Entity<Position>) => setAV(entity, "dl", { x: 0, y: speed }),
  "downright": (entity: Entity<Position>) => setAV(entity, "dr", { x: speed, y: 0 }),
  "": (entity: Entity<Position>) => setAV(entity, undefined, { x: 0, y: 0 })
}

const setAV = (entity: Entity<Position>, animation: AnimationKeys | undefined, velocity: { x: number, y: number }) => {
  const { position, renderable } = entity.components;
  position.setVelocity(velocity);

  const character = renderable?.r as Character;
  if (character && animation) character.setAnimation(animation);
}
