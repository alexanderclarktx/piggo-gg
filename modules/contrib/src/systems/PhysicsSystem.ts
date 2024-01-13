import { Collider, Position, Renderable, worldToScreen } from "@piggo-legends/contrib";
import { Entity, SystemBuilder } from '@piggo-legends/core';
import { Bodies, Body, Composite, Engine } from "matter-js";
import { Graphics } from "pixi.js";

// add 4 walls to the world
const wThickness = 1;
const wWidth = 900;
const wOptions = { isStatic: true };
const walls = [
  Bodies.rectangle(400, -20, wWidth, wThickness, wOptions), // top-right
  Bodies.rectangle(12, 400, wThickness, wWidth, wOptions), // top-left
  Bodies.rectangle(400, 780, wWidth, wThickness, wOptions), // bottom-left
  Bodies.rectangle(815, 400, wThickness, wWidth, wOptions) // bottom-right
];

// PhysicsSystem handles the movement of entities
export const PhysicsSystem: SystemBuilder = ({ game }) => {

  let engine: Engine = Engine.create({ gravity: { x: 0, y: 0 } });
  let bodies: Record<string, Body> = {};
  Composite.add(engine.world, walls);

  let debugEntities: Entity[] = [];

  const onTick = (entities: Entity<Position | Collider>[]) => {

    // handle if debug is on
    if (!game.debug) {
      if (debugEntities.length) {
        Object.values(debugEntities).forEach((entity) => game.removeEntity(entity.id));
        debugEntities = [];
      }
    } else if (!debugEntities.length) {
      engine.world.bodies.forEach((body) => {
        const debugEntity = {
          id: `${body.id}-debug`,
          components: {
            position: new Position(),
            renderable: new Renderable({
              dynamic: (c: Graphics) => {
                c.clear();
                c.beginFill(0xffffff, 0.1);
                c.lineStyle(1, 0xffffff);
                c.drawPolygon(...body.vertices.map((v) => worldToScreen({ x: v.x, y: v.y })));
                c.endFill();
              },
              debuggable: false,
              zIndex: 5,
              container: async () => new Graphics()
            })
          }
        }
        game.addEntity(debugEntity);
        debugEntities.push(debugEntity);
      });
    }

    // handle old physics bodies
    Object.keys(bodies).forEach((id) => {
      if (!game.entities[id]) {
        Composite.remove(engine.world, bodies[id]);
        delete bodies[id];
      }
    });

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
