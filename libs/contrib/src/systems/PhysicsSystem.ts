import { Entity, Renderer, System } from '@piggo-legends/core';
import { Position, Velocity } from "@piggo-legends/contrib";

// PhysicsSystem handles the movement of entities
export const PhysicsSystem = (renderer: Renderer): System => {
  const onTick = (entities: Entity[]) => {
    for (const entity of entities) {      

      // apply entity's velocity to its position
      const {velocity, position} = entity.components as {velocity: Velocity, position: Position}
      if (velocity.v > 0) {
        position.x += Math.sin(position.rotation.rads) * velocity.v;
        position.y -= Math.cos(position.rotation.rads) * velocity.v;
      }
    }
  }

  return {
    renderer,
    componentTypeQuery: ["position", "velocity"],
    onTick
  }
}
