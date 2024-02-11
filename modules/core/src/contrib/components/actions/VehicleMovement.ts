import { Entity, ActionMap, Position } from "@piggo-legends/core";

const TURN_SPEED = 0.1;
const SLIDE_FACTOR = 1.5;

const SPEED = 2;

export type VehicleMovementCommands = "up" | "down" | "left" | "right" | "skidleft" | "skidright";

export const VehicleMovement: ActionMap<VehicleMovementCommands> = {
  "up":
    ({ components }: Entity<Position>) => {
      const x = Math.cos(components.position.data.rotation - Math.PI / 1.35) * SPEED;
      const y = Math.sin(components.position.data.rotation - Math.PI / 1.35) * SPEED;
      components.position.setVelocity({ x, y });
    },
  "down":
    ({ components }: Entity<Position>) => components.position.setVelocity({ x: 0, y: 0 }),
  "left":
    ({ components }: Entity<Position>) => components.position.rotateDown(TURN_SPEED),
  "right":
    ({ components }: Entity<Position>) => components.position.rotateUp(TURN_SPEED),
  "skidleft":
    ({ components }: Entity<Position>) => components.position.rotateDown(TURN_SPEED * SLIDE_FACTOR),
  "skidright":
    ({ components }: Entity<Position>) => components.position.rotateUp(TURN_SPEED * SLIDE_FACTOR),
}
