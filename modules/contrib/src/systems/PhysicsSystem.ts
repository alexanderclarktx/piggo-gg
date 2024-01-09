import { Entity, SystemBuilder } from '@piggo-legends/core';
import { Position } from "@piggo-legends/contrib";

// PhysicsSystem handles the movement of entities
export const PhysicsSystem: SystemBuilder = () => {
  const onTick = (entities: Entity<Position>[]) => {
    entities.forEach((entity) => {
      const { position } = entity.components;
      if (position.velocity > 0) {
        if (position.renderMode === "cartesian") {
          const screenXY = position.toScreenXY();
          const x = screenXY.x + Math.sin(position.rotation.rads) * position.velocity;
          const y = screenXY.y - Math.cos(position.rotation.rads) * position.velocity;

          position.fromScreenXY(x, y);
        } else {
          position.x += Math.sin(position.rotation.rads - Math.PI / 2) * position.velocity;
          position.y -= Math.cos(position.rotation.rads - Math.PI / 2) * position.velocity;
        }
      }
    });
  }

  return {
    componentTypeQuery: ["position"],
    onTick
  }
}
