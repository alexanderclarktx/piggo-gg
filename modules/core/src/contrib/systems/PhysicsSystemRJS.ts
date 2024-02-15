import { Entity, SystemBuilder, ColliderRJS, Position, Renderable, worldToScreen } from '@piggo-legends/core';
import RAPIER, { RigidBody } from "@dimforge/rapier2d-compat";

export let world: RAPIER.World;
RAPIER.init().then(() => world = new RAPIER.World({ x: 0, y: 0 }));

const timeStep32hz = 1.5;

// PhysicsSystemRJS handles the movement of entities (using RapierJS)
export const PhysicsSystemRJS: SystemBuilder = ({ game, mode }) => {

  let bodies: Record<string, RigidBody> = {};
  let lastUpdated = 0;
  let lastRendered = 0;

  const onTick = (entities: Entity<Position | ColliderRJS>[]) => {

    // wait until rapier is ready
    if (!world) return;

    lastUpdated = performance.now();
    lastRendered = lastUpdated;

    // reset the world state
    Object.keys(bodies).forEach((id) => {
      world.removeRigidBody(bodies[id]);
      delete bodies[id];
    });

    // prepare physics bodies for each entity
    entities.forEach((entity) => {
      const { position } = entity.components;

      // handle new physics bodies
      if (!bodies[entity.id]) {
        const { colliderRJS } = entity.components;

        // add body + collider
        const body = world.createRigidBody(colliderRJS.bodyDesc);
        const collider = world.createCollider(colliderRJS.colliderDesc, body);

        // set the component's collider
        colliderRJS.collider = collider;
        colliderRJS.body = body;

        // store body
        bodies[entity.id] = body;
      }

      // update body position
      bodies[entity.id].setTranslation({
        x: Math.round(position.data.x * 100) / 100,
        y: Math.round(position.data.y * 100) / 100
      }, true);

      // update body velocity
      bodies[entity.id].setLinvel({
        x: Math.round(position.data.velocityX * 100) / 100,
        y: Math.round(position.data.velocityY * 100) / 100
      }, true);
    });

    // run physics
    world.timestep = timeStep32hz;
    world.step();

    // update the entity positions
    Object.keys(bodies).forEach((id) => {
      const body = bodies[id];
      const entity = game.entities[id] as Entity<Position>;

      entity.components.position.data.x = Math.round(body.translation().x * 100) / 100;
      entity.components.position.data.y = Math.round(body.translation().y * 100) / 100;
      entity.components.position.data.velocityX = Math.round(body.linvel().x * 100) / 100;
      entity.components.position.data.velocityY = Math.round(body.linvel().y * 100) / 100;
    });

    // reset velocities where needed
    entities.forEach((entity) => {
      if (entity.components.position.data.velocityResets) {
        entity.components.position.data.velocityX = 0;
        entity.components.position.data.velocityY = 0;
      }
    });
  }

  const onRender = (entities: Entity<Position | ColliderRJS>[]) => {

    if (!world) return;

    const delta = performance.now() - lastRendered;
    console.log(delta)

    lastRendered = performance.now();

    world.timestep = (1.5 / 31.25) * (delta / 1000);
    world.step();

    Object.keys(bodies).forEach((id) => {
      // update its renderable position (not position component)
      const entity = game.entities[id] as Entity<Renderable>;
      const renderable = entity.components.renderable;
      if (!renderable) return;
      const body = bodies[id];

      const { x, y } = body.translation();

      if (mode === "isometric") {
        const screenXY = worldToScreen({ x, y });
        renderable.c.position.set(screenXY.x, screenXY.y);
      } else {
        renderable.c.position.set(x, y);
      }
    });
  }

  return {
    query: ["position", "colliderRJS"],
    onTick,
    // onRender // TODO interpolation is jittery
  }
}
