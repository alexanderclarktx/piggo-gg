import { ActionMap, Entity, Position, ValidAction } from "@piggo-legends/core";

const speed = 120;
const speedDiagonal = speed / Math.sqrt(2);
const speedHorizontal = speed / 2;

export type WASDMovementActions = "up" | "down" | "left" | "right" | "upleft" | "upright" | "downleft" | "downright";

export const WASDMovementPhysics: ActionMap<WASDMovementActions> = {
  "up": ValidAction((entity: Entity<Position>) => move(entity, "u", { x: -speedDiagonal, y: -speedDiagonal })),
  "down": ValidAction((entity: Entity<Position>) => move(entity, "d", { x: speedDiagonal, y: speedDiagonal })),
  "left": ValidAction((entity: Entity<Position>) => move(entity, "l", { x: -speedHorizontal, y: speedHorizontal })),
  "right": ValidAction((entity: Entity<Position>) => move(entity, "r", { x: speedHorizontal, y: -speedHorizontal })),
  "upleft": ValidAction((entity: Entity<Position>) => move(entity, "ul", { x: -speed, y: 0 })),
  "upright": ValidAction((entity: Entity<Position>) => move(entity, "ur", { x: 0, y: -speed })),
  "downleft": ValidAction((entity: Entity<Position>) => move(entity, "dl", { x: 0, y: speed })),
  "downright": ValidAction((entity: Entity<Position>) => move(entity, "dr", { x: speed, y: 0 }))
}

const move = (entity: Entity<Position>, animation: string | undefined, velocity: { x: number, y: number }) => {
  const { position, renderable } = entity.components;
  position.setVelocity(velocity);

  if (renderable && animation) renderable.setAnimation(animation);
}
