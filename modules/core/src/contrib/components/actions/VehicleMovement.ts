import { Entity, ActionMap, Position } from "@piggo-legends/core";

const TURN_SPEED = 0.1;
const SLIDE_FACTOR = 1.5;

const SPEED = 2;

export type VehicleMovementCommands = "up" | "down" | "left" | "right" | "skidleft" | "skidright";

export const VehicleMovement: ActionMap<VehicleMovementCommands> = {
  "up":
    ({ components: { position } }: Entity<Position>) => {
      const x = Math.cos(position.data.rotation - Math.PI / 1.35) * SPEED;
      const y = Math.sin(position.data.rotation - Math.PI / 1.35) * SPEED;
      position.setVelocity({ x, y });
    },
  "down": ({ components: { position } }: Entity<Position>) => position.setVelocity({ x: 0, y: 0 }),
  "left": ({ components: { position } }: Entity<Position>) => position.rotateDown(TURN_SPEED),
  "right": ({ components: { position } }: Entity<Position>) => position.rotateUp(TURN_SPEED),
  "skidleft": ({ components: { position } }: Entity<Position>) => position.rotateDown(TURN_SPEED * SLIDE_FACTOR),
  "skidright": ({ components: { position } }: Entity<Position>) => position.rotateUp(TURN_SPEED * SLIDE_FACTOR),
}
