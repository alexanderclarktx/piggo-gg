import { Collider, Position } from "@piggo-legends/contrib";
import { Entity, SystemBuilder } from '@piggo-legends/core';
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
        Body.setPosition(body, { x: position.x, y: position.y });

        // store body
        bodies[entity.id] = body;

        // add body to physics engine
        Composite.add(engine.world, [body]);
      }

      // update body velocity
      Body.setVelocity(bodies[entity.id], position.velocity);
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
