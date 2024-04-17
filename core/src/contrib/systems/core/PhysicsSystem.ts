import RAPIER, { World as RapierWorld, RigidBody } from "@dimforge/rapier2d-compat";
import { Collider, Entity, Position, SystemBuilder } from "@piggo-gg/core";

export let physics: RapierWorld;
RAPIER.init().then(() => physics = new RapierWorld({ x: 0, y: 0 }));

// PhysicsSystem calculates the physics of entities
export const PhysicsSystem: SystemBuilder<"PhysicsSystem"> = ({
  id: "PhysicsSystem",
  init: ({ world }) => {

    let bodies: Record<string, RigidBody> = {};
    let colliders: Record<string, Collider> = {};

    // reset the world state
    const resetPhysics = () => {
      Object.keys(bodies).forEach((id) => {
        delete bodies[id];
        if (colliders[id]) delete colliders[id];
      });
      physics.free();
      physics = new RapierWorld({ x: 0, y: 0 });
    }

    const onTick = (entities: Entity<Position | Collider>[], isRollback: false) => {

      // wait until rapier is ready
      if (!physics) return;

      // reset physics unless in rollback
      if (!isRollback) resetPhysics();

      // remove old bodies
      Object.keys(bodies).forEach((id) => {
        if (!world.entities[id]) {
          physics.removeRigidBody(bodies[id]);
          delete bodies[id];
        }
      });

      // prepare physics bodies for each entity
      entities.sort((a, b) => a.id > b.id ? 1 : -1).forEach((entity) => {
        const { position } = entity.components;

        // handle new physics bodies
        if (!bodies[entity.id]) {
          const { collider } = entity.components;

          // create rapier body/collider
          const body = physics.createRigidBody(collider.bodyDesc);
          collider.rapierCollider = physics.createCollider(collider.colliderDesc, body);

          // set Collider.body
          collider.body = body;

          // store body
          bodies[entity.id] = body;

          // store collider
          colliders[entity.id] = collider;
        }

        // update body position
        bodies[entity.id].setTranslation({ x: position.data.x, y: position.data.y }, true);

        // update body velocity
        bodies[entity.id].setLinvel({
          x: Math.floor(position.data.velocityX * 100) / 100,
          y: Math.floor(position.data.velocityY * 100) / 100
        }, true);
      });

      // run physics
      physics.switchToSmallStepsPgsSolver(); // https://github.com/dimforge/rapier.js/blob/master/src.ts/pipeline/world.ts#L400
      physics.timestep = 0.025;
      physics.step();

      // update the entity positions
      Object.keys(bodies).forEach((id) => {
        const body = bodies[id];
        const entity = world.entities[id] as Entity<Position>;

        entity.components.position.data.x = Math.round(body.translation().x * 100) / 100;
        entity.components.position.data.y = Math.round(body.translation().y * 100) / 100;
        entity.components.position.data.velocityX = Math.floor(body.linvel().x * 100) / 100;
        entity.components.position.data.velocityY = Math.floor(body.linvel().y * 100) / 100;
      });

      // sensor callbacks
      Object.values(colliders).forEach((collider: Collider) => {
        if (collider.sensor) {
          physics.intersectionPairsWith(collider.rapierCollider, (collider2) => {
            const entry = Object.entries(colliders).find(([_, c]) => c.rapierCollider === collider2);
            if (entry) {
              const id = entry[0];
              if (world.entities[id]) collider.sensor(world.entities[id] as Entity<Position>, world)
            }
          });
        }
      });

      // clear heading if arrived
      entities.forEach((entity) => {
        const { position } = entity.components;
        if (position.data.headingX || position.data.headingY) {
          const dx = position.data.headingX - position.data.x;
          const dy = position.data.headingY - position.data.y;
          if (Math.abs(dx) < 5 && Math.abs(dy) < 5) {
            position.data.headingX = NaN;
            position.data.headingY = NaN;
          }
        }
      });

      // reset velocities where needed
      entities.forEach((entity) => {
        const { position } = entity.components;
        if (position.data.velocityResets && !position.data.headingX && !position.data.headingY) {
          position.data.velocityX = 0;
          position.data.velocityY = 0;
        }
      });
    }

    return {
      id: "PhysicsSystem",
      query: ["position", "collider"],
      onTick,
      onRollback: resetPhysics
    }
  }
});
