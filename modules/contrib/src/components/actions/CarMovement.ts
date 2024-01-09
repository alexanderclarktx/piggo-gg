import { ActionMap } from "@piggo-legends/contrib";
import { Entity } from "@piggo-legends/core";

const TURN_SPEED = 0.06;
const SLIDE_FACTOR = 1.5;

const ACCELERATION = 0.05;
const DECELERATION = 0.1;
const MAX_VELOCITY = 7;

export type CarMovementCommands = "up" | "down" | "left" | "right" | "skidleft" | "skidright";

export const CarMovement: ActionMap<CarMovementCommands> = {
  "up": (entity: Entity) => entity.components.position?.setVelocity(Math.min(entity.components.position.velocity + ACCELERATION, MAX_VELOCITY)),
  "down": (entity: Entity) => entity.components.position?.setVelocity(Math.max(entity.components.position.velocity - DECELERATION, 0)),
  "left": (entity: Entity) => entity.components.position?.rotation.minus(TURN_SPEED),
  "right": (entity: Entity) => entity.components.position?.rotation.plus(TURN_SPEED),
  "skidleft": (entity: Entity) => entity.components.position?.rotation.minus(TURN_SPEED * SLIDE_FACTOR),
  "skidright": (entity: Entity) => entity.components.position?.rotation.plus(TURN_SPEED * SLIDE_FACTOR),
}
