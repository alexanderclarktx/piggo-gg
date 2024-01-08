import { ActionMap, Position, Renderable } from "@piggo-legends/contrib";
import { Entity } from "@piggo-legends/core";

const TURN_SPEED = 0.06;
const SLIDE_FACTOR = 1.5;

const ACCELERATION = 0.05;
const DECELERATION = 0.1;
const MAX_VELOCITY = 7;

export type CarMovementCommands = "up" | "down" | "left" | "right" | "skidleft" | "skidright";

export const CarMovement: ActionMap<CarMovementCommands> = {
  "up": (entity: Entity) => {
    const position = entity.components.position as Position;
    position.velocity = Math.min(position.velocity + ACCELERATION, MAX_VELOCITY);
  },
  "down": (entity: Entity) => {
    const position = entity.components.position as Position;
    position.velocity = Math.max(position.velocity - DECELERATION, 0);
  },
  "left": (entity: Entity) => {
    const {position, renderable} = entity.components as {position: Position, renderable: Renderable}

    position.rotation.minus(TURN_SPEED);
    renderable.c.rotation = position.rotation.rads;
  },
  "right": (entity: Entity) => {
    const {position, renderable} = entity.components as {position: Position, renderable: Renderable}

    position.rotation.plus(TURN_SPEED);
    renderable.c.rotation = position.rotation.rads;
  },
  "skidleft": (entity: Entity) => {
    const {position, renderable} = entity.components as {position: Position, renderable: Renderable}

    position.rotation.minus(TURN_SPEED * SLIDE_FACTOR);
    renderable.c.rotation = position.rotation.rads;
  },
  "skidright": (entity: Entity) => {
    const {position, renderable} = entity.components as {position: Position, renderable: Renderable}

    position.rotation.plus(TURN_SPEED * SLIDE_FACTOR);
    renderable.c.rotation = position.rotation.rads;
  }
}
