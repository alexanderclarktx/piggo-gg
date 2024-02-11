import { Entity, SystemBuilder, Collider, Position } from '@piggo-legends/core';
import { Body, Composite, Engine } from "matter-js";

// PhysicsSystem handles the movement of entities
export const PhysicsSystem: SystemBuilder = ({ game }) => {

  let engine: Engine = Engine.create({ gravity: { x: 0, y: 0 } });
  let bodies: Record<string, Body> = {};

  const onTick = (entities: Entity<Position | Collider>[]) => {

    // handle old physics bodies
    Object.keys(bodies).forEach((id) => {
      if (!game.entities[id]) {
        Composite.remove(engine.world, bodies[id]);
        delete bodies[id];
      }
    });

    // prepare physics bodies for each entity
    entities.forEach((entity) => {
      const { position } = entity.components;

      // handle new physics bodies
      if (!bodies[entity.id]) {
        // get body from collider
        const body = entity.components.collider.body;

        // set initial position
        Body.setPosition(body, { x: position.data.x, y: position.data.y });

        // store body
        bodies[entity.id] = body;

        // add body to physics engine
        Composite.add(engine.world, [body]);
      }

      // update body velocity
      Body.setVelocity(bodies[entity.id], { x: position.data.velocityX, y: position.data.velocityY });
    });

    // run physics
    Engine.update(engine, 1000 / 30);

    // update the entity positions
    Object.keys(bodies).forEach((id) => {
      const body = bodies[id];
      const entity = game.entities[id] as Entity<Position>;
      entity.components.position.data.x = body.position.x;
      entity.components.position.data.y = body.position.y;
      entity.components.position.data.velocityX = body.velocity.x;
      entity.components.position.data.velocityY = body.velocity.y;
    });
  }

  return {
    componentTypeQuery: ["position", "collider"],
    onTick
  }
}
