import { Entity, ActionMap, Position, ValidAction } from "@piggo-gg/core";

const TURN_SPEED = 0.1;
const SLIDE_FACTOR = 1.5;
const SPEED = 2;

export type VehicleMovementActions = "up" | "down" | "left" | "right" | "skidleft" | "skidright";

export const VehicleMovement: ActionMap<VehicleMovementActions> = {
  "up": ValidAction(({ components: { position } }: Entity<Position>) => {
    const x = Math.cos(position.data.rotation - Math.PI / 1.35) * SPEED;
    const y = Math.sin(position.data.rotation - Math.PI / 1.35) * SPEED;
    position.setVelocity({ x, y });
  }),
  "down": ValidAction(({ components: { position } }: Entity<Position>) => position.setVelocity({ x: 0, y: 0 })),
  "left": ValidAction(({ components: { position } }: Entity<Position>) => position.rotateDown(TURN_SPEED)),
  "right": ValidAction(({ components: { position } }: Entity<Position>) => position.rotateUp(TURN_SPEED)),
  "skidleft": ValidAction(({ components: { position } }: Entity<Position>) => position.rotateDown(TURN_SPEED * SLIDE_FACTOR)),
  "skidright": ValidAction(({ components: { position } }: Entity<Position>) => position.rotateUp(TURN_SPEED * SLIDE_FACTOR))
}
