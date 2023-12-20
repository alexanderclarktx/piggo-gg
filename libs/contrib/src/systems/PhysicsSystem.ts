import { Entity, System } from '@piggo-legends/core';
import { Position, Velocity } from "@piggo-legends/contrib";

export type PhysicsSystemProps = {
  mode?: "cartesian" | "isometric"
}

// PhysicsSystem handles the movement of entities
export const PhysicsSystem = ({ mode }: PhysicsSystemProps): System => {
  const onTick = (entities: Entity[]) => {
    for (const entity of entities) {      

      // apply entity's velocity to its position
      const {velocity, position} = entity.components as {velocity: Velocity, position: Position}
      if (velocity.v > 0) {
        if (mode === "isometric") {
          const screenXY = position.toScreenXY();
          const x = screenXY.x + Math.sin(position.rotation.rads) * velocity.v;
          const y = screenXY.y - Math.cos(position.rotation.rads) * velocity.v;

          position.fromScreenXY(x, y);
        } else {
          position.x += Math.sin(position.rotation.rads) * velocity.v;
          position.y -= Math.cos(position.rotation.rads) * velocity.v;
        }
      }
    }
  }

  return {
    componentTypeQuery: ["position", "velocity"],
    onTick
  }
}
