import { Entity, SystemBuilder, Collider, Position, Renderable, worldToScreen } from '@piggo-legends/core';
import RAPIER, { RigidBody } from "@dimforge/rapier2d-compat";

export let physics: RAPIER.World;
RAPIER.init().then(() => physics = new RAPIER.World({ x: 0, y: 0 }));

const timeFactor = 1.5;

// PhysicsSystem handles the movement of entities (using RapierJS)
export const PhysicsSystem: SystemBuilder = ({ world, mode }) => {

  let bodies: Record<string, RigidBody> = {};
  let lastUpdated = 0;
  let lastRendered = 0;

  const onTick = (entities: Entity<Position | Collider>[]) => {

    // wait until rapier is ready
    if (!physics) return;

    lastUpdated = performance.now();
    lastRendered = lastUpdated;

    // reset the world state
    Object.keys(bodies).forEach((id) => {
      physics.removeRigidBody(bodies[id]);
      delete bodies[id];
    });

    // prepare physics bodies for each entity
    entities.forEach((entity) => {
      const { position } = entity.components;

      // handle new physics bodies
      if (!bodies[entity.id]) {
        const { collider } = entity.components;

        // add body + collider
        const body = physics.createRigidBody(collider.bodyDesc);
        const rapierCollider = physics.createCollider(collider.colliderDesc, body);

        // set the component's collider
        collider.rapierCollider = rapierCollider;
        collider.body = body;

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
    physics.timestep = timeFactor;
    physics.step();

    // update the entity positions
    Object.keys(bodies).forEach((id) => {
      const body = bodies[id];
      const entity = world.entities[id] as Entity<Position>;

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

  const onRender = (entities: Entity<Position | Collider>[]) => {

    if (!world) return;

    const delta = performance.now() - lastRendered;
    console.log(delta)

    lastRendered = performance.now();

    physics.timestep = (1.5 / 31.25) * (delta / 1000);
    physics.step();

    Object.keys(bodies).forEach((id) => {
      // update its renderable position (not position component)
      const entity = world.entities[id] as Entity<Renderable>;
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
    id: "PhysicsSystem",
    query: ["position", "collider"],
    onTick,
    // onRender // TODO interpolation is jittery
  }
}
