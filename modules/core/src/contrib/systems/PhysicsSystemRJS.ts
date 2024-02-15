import { Entity, SystemBuilder, ColliderRJS, Position } from '@piggo-legends/core';
import RAPIER from "@dimforge/rapier2d-compat";

export let world: RAPIER.World;
RAPIER.init().then(() => world = new RAPIER.World({ x: 0, y: 0 }));

// PhysicsSystemRJS handles the movement of entities (using RapierJS)
export const PhysicsSystemRJS: SystemBuilder = ({ game }) => {

  let bodies: Record<string, RAPIER.RigidBody> = {};

  const onTick = (entities: Entity<Position | ColliderRJS>[]) => {

    // wait until rapier is ready
    if (!world) return;

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
    world.timestep = 1.5;
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

  return {
    query: ["position", "colliderRJS"],
    onTick
  }
}
