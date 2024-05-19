import { Entity, ActionMap, Position, Action } from "@piggo-gg/core";

const TURN_SPEED = 0.1;
const SLIDE_FACTOR = 1.5;
const SPEED = 200;

export type VehicleMovementActions = "up" | "down" | "left" | "right" | "skidleft" | "skidright";

export const check = (entity: Entity | undefined, callback: (_: Entity<Position>) => void) => {
  if (!entity || !entity.components.position) return;
  callback(entity as Entity<Position>);
}

export const VehicleMovement: ActionMap<VehicleMovementActions> = {
  up: Action(({entity}) => check(entity, ({components: {position} }) => {
    const x = Math.cos(position.data.rotation - Math.PI / 2) * SPEED;
    const y = Math.sin(position.data.rotation - Math.PI / 2) * SPEED;
    position.setVelocity({ x, y });
  })),
  down: Action(({entity}) => check(entity, ({components:{ position}}) => position.setVelocity({ x: 0, y: 0 }))),
  left: Action(({entity}) => check(entity, ({components: {position}}) => position.rotateDown(TURN_SPEED))),
  right: Action(({entity}) => check(entity, ({components: {position}}) => position.rotateUp(TURN_SPEED))),
  skidleft: Action(({entity}) => check(entity, ({components: {position}}) => position.rotateDown(TURN_SPEED * SLIDE_FACTOR))),
  skidright: Action(({entity}) => check(entity, ({components: {position}}) => position.rotateUp(TURN_SPEED * SLIDE_FACTOR)))
}
