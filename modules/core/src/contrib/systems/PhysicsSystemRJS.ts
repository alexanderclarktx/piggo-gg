import { Entity, SystemBuilder, ColliderRJS, Position } from '@piggo-legends/core';
import RAPIER from "@dimforge/rapier2d-compat";

export let world: RAPIER.World;
RAPIER.init().then(() => world = new RAPIER.World({ x: 0, y: 0 }));

const shash = (str: string) => {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
  }
  return hash;
}

// PhysicsSystemRJS handles the movement of entities (using RapierJS)
export const PhysicsSystemRJS: SystemBuilder = ({ game }) => {

  let bodies: Record<string, RAPIER.RigidBody> = {};

  const onTick = (entities: Entity<Position | ColliderRJS>[]) => {

    // wait until rapier is ready
    if (!world) return;

    // debug log the world snapshot hash
    if (game.tick % 300 === 0) {
      // console.log(game.tick, shash(btoa(world.takeSnapshot().toString())));
    }

    // handle old physics bodies
    Object.keys(bodies).forEach((id) => {
      if (!game.entities[id]) {
        world.removeRigidBody(bodies[id]);
        delete bodies[id];
      }
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
        x: Number(position.data.x.toFixed(2)),
        y: Number(position.data.y.toFixed(2))
      }, true);

      // update body velocity
      bodies[entity.id].setLinvel({
        x: Number(position.data.velocityX.toFixed(2)),
        y: Number(position.data.velocityY.toFixed(2))
      }, true);
    });

    // run physics
    world.timestep = 1.5;
    world.step();

    // update the entity positions
    Object.keys(bodies).forEach((id) => {
      const body = bodies[id];
      const entity = game.entities[id] as Entity<Position>;

      entity.components.position.data.x = Number(body.translation().x.toFixed(2));
      entity.components.position.data.y = Number(body.translation().y.toFixed(2));
      entity.components.position.data.velocityX = Number(body.linvel().x.toFixed(2));
      entity.components.position.data.velocityY = Number(body.linvel().y.toFixed(2));
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
