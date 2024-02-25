import RAPIER, { World as RapierWorld, RigidBody } from "@dimforge/rapier2d-compat";
import { Collider, Entity, Position, SystemBuilder } from '@piggo-legends/core';

export let physics: RapierWorld;
RAPIER.init().then(() => physics = new RapierWorld({ x: 0, y: 0 }));

const timeFactor = 1.5;

// PhysicsSystem handles the physics of entity colliders (using RapierJS)
export const PhysicsSystem: SystemBuilder = ({ world }) => {

  let bodies: Record<string, RigidBody> = {};
  let colliders: Record<string, Collider> = {};

  const onTick = (entities: Entity<Position | Collider>[]) => {

    // wait until rapier is ready
    if (!physics) return;

    // reset the world state
    Object.keys(bodies).forEach((id) => {
      physics.removeRigidBody(bodies[id]);
      delete bodies[id];
      if (colliders[id]) delete colliders[id];
    });

    // prepare physics bodies for each entity
    entities.sort((a, b) => a.id > b.id ? 1 : -1).forEach((entity) => {
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

        // store collider
        colliders[entity.id] = collider;
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

    // sensor callbacks
    Object.values(colliders).forEach((collider: Collider) => {
      if (collider.sensor) {
        physics.intersectionPairsWith(collider.rapierCollider, (collider2) => {
          const entry = Object.entries(colliders).find(([_, c]) => c.rapierCollider === collider2);
          if (entry) {
            const id = entry[0];
            if (world.entities[id]) collider.sensor(world.entities[id], world)
          }
        });
      }
    });

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

  return {
    id: "PhysicsSystem",
    query: ["position", "collider"],
    onTick
  }
}
