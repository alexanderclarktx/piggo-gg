import { ActionMap, Position, Renderable, RenderableProps } from "@piggo-legends/contrib";
import { Entity, EntityProps, Game, GameProps } from "@piggo-legends/core";

const MAX_VELOCITY = 100;
const ACCELERATION = 0.2;
const FRICTION = 0.05;
const TURN_SPEED = 0.015;
const SLIDE_FACTOR = 2;
const SLIDE_ACCELERATION = 0.3;

const speed = 1;

export const CarMovement: ActionMap = {
  "up": (entity: Entity<EntityProps>, _: Game<GameProps>) => {
    const position = entity.props.components.position as Position;
    const renderable = entity.props.components.renderable as Renderable<RenderableProps>;

    position.x += Math.sin(renderable.c.rotation) * speed;
    position.y -= Math.cos(renderable.c.rotation) * speed;
  },
  "down": (entity: Entity<EntityProps>, _: Game<GameProps>) => {
    const position = entity.props.components.position as Position;
    const renderable = entity.props.components.renderable as Renderable<RenderableProps>;

    position.x -= Math.sin(renderable.c.rotation) * speed;
    position.y += Math.cos(renderable.c.rotation) * speed;
  },
  "left": (entity: Entity<EntityProps>, _: Game<GameProps>) => {
    const renderable = entity.props.components.renderable as Renderable<RenderableProps>;
    renderable.c.rotation -= TURN_SPEED;
  },
  "right": (entity: Entity<EntityProps>, _: Game<GameProps>) => {
    const renderable = entity.props.components.renderable as Renderable<RenderableProps>;
    renderable.c.rotation += TURN_SPEED;
  },
  "skidleft": (entity: Entity<EntityProps>, _: Game<GameProps>) => {
    const renderable = entity.props.components.renderable as Renderable<RenderableProps>;
    renderable.c.rotation -= TURN_SPEED * SLIDE_FACTOR;
  },
  "skidright": (entity: Entity<EntityProps>, _: Game<GameProps>) => {
    const renderable = entity.props.components.renderable as Renderable<RenderableProps>;
    renderable.c.rotation += TURN_SPEED * SLIDE_FACTOR;
  }
}
