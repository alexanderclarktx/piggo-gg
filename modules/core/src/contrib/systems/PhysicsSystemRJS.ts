import { Entity, SystemBuilder, ColliderRJS, Position } from '@piggo-legends/core';
import RAPIER from "@dimforge/rapier2d-compat";

// PhysicsSystemRJS handles the movement of entities (using RapierJS)
export const PhysicsSystemRJS: SystemBuilder = ({ game }) => {

  let world: RAPIER.World;

  RAPIER.init().then(() => {
    world = new RAPIER.World({ x: 0, y: 0 });
  });

  let bodies: Record<string, RAPIER.RigidBody> = {};

  const onTick = (entities: Entity<Position | ColliderRJS>[]) => {

    if (!world) {
      console.log("world not ready");
      return;
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
        // console.log("adding");
        // add body + collider
        const body = world.createRigidBody(entity.components.colliderRJS.body);
        world.createCollider(entity.components.colliderRJS.c, body);

        // store body
        bodies[entity.id] = body;
      }

      // update body position
      bodies[entity.id].setTranslation({
        x: Number(position.data.x.toFixed(1)),
        y: Number(position.data.y.toFixed(1))
      }, true);

      // update body velocity
      bodies[entity.id].setLinvel({
        x: Number(position.data.velocityX.toFixed(1)),
        y: Number(position.data.velocityY.toFixed(1))
      }, true);
    });

    // run physics
    world.timestep = 1.5;
    world.step();
    // console.log("step");
    // console.log(world.bodies.len());

    // update the entity positions
    Object.keys(bodies).forEach((id) => {
      const body = bodies[id];
      const entity = game.entities[id] as Entity<Position>;

      entity.components.position.data.x = Number(body.translation().x.toFixed(1));
      entity.components.position.data.y = Number(body.translation().y.toFixed(1));
      entity.components.position.data.velocityX = Number(body.linvel().x.toFixed(1));
      entity.components.position.data.velocityY = Number(body.linvel().y.toFixed(1));
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
    componentTypeQuery: ["position", "colliderRJS"],
    onTick
  }
}
