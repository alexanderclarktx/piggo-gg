import { ActionMap, Entity, Position } from "@piggo-legends/core";

const speed = 120;
const speedDiagonal = speed / Math.sqrt(2);
const speedHorizontal = speed / 2;

export type WASDMovementActions = "up" | "down" | "left" | "right" | "upleft" | "upright" | "downleft" | "downright";

export const WASDMovementPhysics: ActionMap<WASDMovementActions> = {
  "up": {
    apply: (entity: Entity<Position>) => move(entity, "u", { x: -speedDiagonal, y: -speedDiagonal }),
    validate: () => true
  },
  "down": {
    apply: (entity: Entity<Position>) => move(entity, "d", { x: speedDiagonal, y: speedDiagonal }),
    validate: () => true
  },
  "left": {
    apply: (entity: Entity<Position>) => move(entity, "l", { x: -speedHorizontal, y: speedHorizontal }),
    validate: () => true
  },
  "right": {
    apply: (entity: Entity<Position>) => move(entity, "r", { x: speedHorizontal, y: -speedHorizontal }),
    validate: () => true
  },
  "upleft": {
    apply: (entity: Entity<Position>) => move(entity, "ul", { x: -speed, y: 0 }),
    validate: () => true
  },
  "upright": {
    apply: (entity: Entity<Position>) => move(entity, "ur", { x: 0, y: -speed }),
    validate: () => true
  },
  "downleft": {
    apply: (entity: Entity<Position>) => move(entity, "dl", { x: 0, y: speed }),
    validate: () => true
  },
  "downright": {
    apply: (entity: Entity<Position>) => move(entity, "dr", { x: speed, y: 0 }),
    validate: () => true
  }
}

const move = (entity: Entity<Position>, animation: string | undefined, velocity: { x: number, y: number }) => {
  const { position, renderable } = entity.components;
  position.setVelocity(velocity);

  if (renderable && animation) renderable.setAnimation(animation);
}
