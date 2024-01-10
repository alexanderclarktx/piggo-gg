import { ActionMap, Position } from "@piggo-legends/contrib";
import { Entity } from "@piggo-legends/core";

const TURN_SPEED = 0.1;
const SLIDE_FACTOR = 1.5;

const SPEED = 2;

export type VehicleMovementCommands = "up" | "down" | "left" | "right" | "skidleft" | "skidright";

export const VehicleMovement: ActionMap<VehicleMovementCommands> = {
  "up": (entity: Entity<Position>) => {
    const x = Math.cos(entity.components.position.rotation.rads - Math.PI / 1.35) * SPEED;
    const y = Math.sin(entity.components.position.rotation.rads - Math.PI / 1.35) * SPEED;
    entity.components.position?.setVelocity({ x, y });
  },
  "down": (entity: Entity) => entity.components.position?.setVelocity({ x: 0, y: 0 }),
  "left": (entity: Entity) => entity.components.position?.rotation.minus(TURN_SPEED),
  "right": (entity: Entity) => entity.components.position?.rotation.plus(TURN_SPEED),
  "skidleft": (entity: Entity) => entity.components.position?.rotation.minus(TURN_SPEED * SLIDE_FACTOR),
  "skidright": (entity: Entity) => entity.components.position?.rotation.plus(TURN_SPEED * SLIDE_FACTOR),
}
