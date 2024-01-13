import { Entity, SystemBuilder } from '@piggo-legends/core';
import { Collider, Position } from "@piggo-legends/contrib";
import { Engine, Bodies, Composite, Body, Events } from "matter-js";

// add 4 walls to the world
const wThickness = 1;
const wWidth = 1000;
const wOptions = { isStatic: true };
const walls = [
  Bodies.rectangle(400, -20, wWidth, wThickness, wOptions),
  Bodies.rectangle(10, 400, wThickness, wWidth, wOptions),
  Bodies.rectangle(400, 780, wWidth, wThickness, wOptions),
  Bodies.rectangle(815, 400, wThickness, wWidth, wOptions)
];

// PhysicsSystem handles the movement of entities
export const PhysicsSystem: SystemBuilder = ({ game }) => {

  let engine: Engine = Engine.create({ gravity: { x: 0, y: 0 } });
  let bodies: Record<string, Body> = {};
  Composite.add(engine.world, walls);

  const onTick = (entities: Entity<Position | Collider>[]) => {

    // handle old physics bodies
    Object.keys(bodies).forEach((id) => (!game.entities[id]) ? delete bodies[id] : 0);

    // prepare physics bodies for each entity
    entities.forEach((entity) => {

      // handle new physics bodies
      if (!bodies[entity.id]) {
        const { collider: c, position: p } = entity.components;

        const newBody = Bodies.circle(p.x, p.y, c.radius, { frictionAir: 0 });

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
