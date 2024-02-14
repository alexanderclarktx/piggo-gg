import { Entity, SystemBuilder, ColliderMJS, Position } from '@piggo-legends/core';
import { Body, Composite, Engine } from "matter-js";

// PhysicsSystem handles the movement of entities
export const PhysicsSystemMJS: SystemBuilder = ({ game }) => {

  let engine: Engine = Engine.create({
    gravity: { x: 0, y: 0 },
    positionIterations: 1,
    velocityIterations: 1,
    constraintIterations: 1
  });
  let bodies: Record<string, Body> = {};

  const onTick = (entities: Entity<Position | ColliderMJS>[]) => {

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
        const body = entity.components.colliderMJS.body;

        // store body
        bodies[entity.id] = body;

        // add body to physics engine
        Composite.add(engine.world, [body]);
      }

      // update body position
      Body.setPosition(bodies[entity.id], {
        x: position.data.x,
        y: position.data.y
      });

      // update body velocity
      Body.setVelocity(bodies[entity.id], { x: position.data.velocityX, y: position.data.velocityY });
    });

    Engine.update(engine, game.tickrate);

    // update the entity positions
    Object.keys(bodies).forEach((id) => {
      const body = bodies[id];
      const entity = game.entities[id] as Entity<Position>;

      entity.components.position.data.x = Number(body.position.x.toFixed(1));
      entity.components.position.data.y = Number(body.position.y.toFixed(1));
      entity.components.position.data.velocityX = Number(body.velocity.x.toFixed(1));
      entity.components.position.data.velocityY = Number(body.velocity.y.toFixed(1));
    });
  }

  return {
    componentTypeQuery: ["position", "collider"],
    onTick
  }
}
