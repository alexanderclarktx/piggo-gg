import { Entity, SystemBuilder } from '@piggo-legends/core';
import { Collider, Position } from "@piggo-legends/contrib";
import { Engine, Bodies, Composite, Body } from "matter-js";

// PhysicsSystem handles the movement of entities
export const PhysicsSystem: SystemBuilder = ({ game }) => {

  let engine: Engine = Engine.create({ gravity: { x: 0, y: 0 } });
  let bodies: Record<string, Body> = {};

  const onTick = (entities: Entity<Position | Collider>[]) => {

    // handle old physics bodies
    Object.keys(bodies).forEach((id) => (!game.entities[id]) ? delete bodies[id] : 0);

    // prepare physics bodies for each entity
    entities.forEach((entity) => {

      // handle new physics bodies
      if (!bodies[entity.id]) {
        const { collider: c, position: p } = entity.components;

        const newBody = Bodies.circle(p.x, p.y, c.radius, {
          // friction: 0,
          // frictionStatic: 0,
          frictionAir: 0,
          restitution: 0.9,
          density: c.mass,
        });
        console.log(newBody);

        Composite.add(engine.world, [newBody]);
        bodies[entity.id] = newBody;
      }

      // update body velocity
      const body = bodies[entity.id];
      const { velocity } = entity.components.position;
      Body.setVelocity(body, velocity);
    });

    // run physics
    Engine.update(engine, 1000 / 30);

    // update the entity positions
    Object.keys(bodies).forEach((id) => {
      const body = bodies[id];
      const entity = game.entities[id];
      entity.components.position!.x = body.position.x;
      entity.components.position!.y = body.position.y;
    });
  }

  return {
    componentTypeQuery: ["position", "collider"],
    onTick
  }
}
