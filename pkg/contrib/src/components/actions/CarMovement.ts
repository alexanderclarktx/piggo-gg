import { ActionMap, Position, Renderable, RenderableProps } from "@piggo-legends/contrib";
import { Entity } from "@piggo-legends/core";

// const MAX_VELOCITY = 100;
// const ACCELERATION = 0.2;
// const FRICTION = 0.05;
// const SLIDE_ACCELERATION = 0.3;

const SPEED = 2;
const TURN_SPEED = 0.03;
const SLIDE_FACTOR = 1.5;

export type CarMovementCommands = "up" | "down" | "left" | "right" | "skidleft" | "skidright";

export const CarMovement: ActionMap<CarMovementCommands> = {
  "up": (entity: Entity) => {
    const position = entity.components.position as Position;
    const renderable = entity.components.renderable as Renderable<RenderableProps>;

    position.x += Math.sin(renderable.c.rotation) * SPEED;
    position.y -= Math.cos(renderable.c.rotation) * SPEED;
  },
  "down": (entity: Entity) => {
    const position = entity.components.position as Position;
    const renderable = entity.components.renderable as Renderable<RenderableProps>;

    position.x -= Math.sin(renderable.c.rotation) * SPEED;
    position.y += Math.cos(renderable.c.rotation) * SPEED;
  },
  "left": (entity: Entity) => {
    const position = entity.components.position as Position;
    const renderable = entity.components.renderable as Renderable<RenderableProps>;

    position.rotation.minus(TURN_SPEED);
    renderable.c.rotation = position.rotation.rads;
  },
  "right": (entity: Entity) => {
    const position = entity.components.position as Position;
    const renderable = entity.components.renderable as Renderable<RenderableProps>;

    position.rotation.plus(TURN_SPEED);
    renderable.c.rotation = position.rotation.rads;
  },
  "skidleft": (entity: Entity) => {
    const position = entity.components.position as Position;
    const renderable = entity.components.renderable as Renderable<RenderableProps>;

    position.rotation.minus(TURN_SPEED * SLIDE_FACTOR);
    renderable.c.rotation = position.rotation.rads;
  },
  "skidright": (entity: Entity) => {
    const position = entity.components.position as Position;
    const renderable = entity.components.renderable as Renderable<RenderableProps>;

    position.rotation.plus(TURN_SPEED * SLIDE_FACTOR);
    renderable.c.rotation = position.rotation.rads;
  }
}
