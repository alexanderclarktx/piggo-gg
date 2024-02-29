import { Entity, ActionMap, Position } from "@piggo-legends/core";

const TURN_SPEED = 0.1;
const SLIDE_FACTOR = 1.5;

const SPEED = 2;

export type VehicleMovementActions = "up" | "down" | "left" | "right" | "skidleft" | "skidright";

export const VehicleMovement: ActionMap<VehicleMovementActions> = {
  "up": {
    validate: () => true,
    apply: ({ components: { position } }: Entity<Position>) => {
      const x = Math.cos(position.data.rotation - Math.PI / 1.35) * SPEED;
      const y = Math.sin(position.data.rotation - Math.PI / 1.35) * SPEED;
      position.setVelocity({ x, y });
    }
  },
  "down": {
    validate: () => true,
    apply: ({ components: { position } }: Entity<Position>) => position.setVelocity({ x: 0, y: 0 })
  },
  "left": {
    validate: () => true,
    apply: ({ components: { position } }: Entity<Position>) => position.rotateDown(TURN_SPEED)
  },
  "right": {
    validate: () => true,
    apply: ({ components: { position } }: Entity<Position>) => position.rotateUp(TURN_SPEED)
  },
  "skidleft": {
    validate: () => true,
    apply: ({ components: { position } }: Entity<Position>) => position.rotateDown(TURN_SPEED * SLIDE_FACTOR)
  },
  "skidright": {
    validate: () => true,
    apply: ({ components: { position } }: Entity<Position>) => position.rotateUp(TURN_SPEED * SLIDE_FACTOR)
  }
}
