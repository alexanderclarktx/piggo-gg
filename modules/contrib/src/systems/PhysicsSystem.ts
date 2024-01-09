import { Entity, SystemBuilder } from '@piggo-legends/core';
import { Collider, Position } from "@piggo-legends/contrib";

// PhysicsSystem handles the movement of entities
export const PhysicsSystem: SystemBuilder = ({ game }) => {

  let colliders: Record<string, Entity<Position | Collider>> = {};

  type box = { x: number, y: number, width: number, height: number };

  const intersect = (a: box, b: box) => (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  )

  const onTick = (entities: Entity<Position | Collider>[]) => {
    // remove old colliders
    Object.keys(colliders).forEach((id) => (!game.entities[id]) ? delete colliders[id] : 0);

    entities.forEach((entity) => {

      // add new colliders
      if (!colliders[entity.id]) colliders[entity.id] = entity;

      const { position, collider } = entity.components;
      if (position.velocity > 0) {
        if (position.renderMode === "cartesian") {
          const screenXY = position.toScreenXY();
          const x = screenXY.x + Math.sin(position.rotation.rads) * position.velocity;
          const y = screenXY.y - Math.cos(position.rotation.rads) * position.velocity;

          position.fromScreenXY(x, y);
        } else {

          // calculate the new position
          let newX = Math.sin(position.rotation.rads - Math.PI / 2) * position.velocity;
          let newY = Math.cos(position.rotation.rads - Math.PI / 2) * position.velocity;

          // see if the new position collides with anything
          Object.values(colliders).filter((otherCollider) => otherCollider.id !== entity.id).forEach((otherCollider) => {

            const { position: p, collider: c } = otherCollider.components;

            // check if the two boxes overlap
            const box1 = { x: p.x, y: p.y, width: c.x, height: c.y };
            const box2 = { x: position.x + newX, y: position.y + newY, width: collider.x, height: collider.y };

            if (intersect(box1, box2)) {
              // console.log("collision!");
              newX = 0;
              newY = 0;
            }
          });

          position.x += newX;
          position.y -= newY;
        }
      }
    });
  }

  return {
    componentTypeQuery: ["position", "collider"],
    onTick
  }
}
