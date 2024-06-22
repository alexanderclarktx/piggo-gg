import { Polyline } from "@dimforge/rapier2d-compat";
import { ClientSystemBuilder, Collider, Entity, Position, Renderable, Team, physics } from "@piggo-gg/core";

export const SightSystem = ClientSystemBuilder({
  id: "SightSystem",
  init: (world) => ({
    id: "SightSystem",
    query: ["team", "renderable"],
    onTick: (entities: Entity<Team | Renderable | Position | Collider>[]) => {

      const playerCharacter = world.client?.playerCharacter();
      if (!playerCharacter) return;

      const { position: playerPosition, collider: playerCollider, team: playerTeam } = playerCharacter.components;
      if (!playerPosition || !playerCollider || !playerTeam) return;

      entities.forEach((entity) => {

        // ignore the player character
        if (entity.id === playerCharacter.id) return;

        const { team, renderable, collider, position } = entity.components;

        if (team.data.team === playerTeam.data.team) {
          renderable.visible = true;
        } else {
          let hit = false;

          const line = [0, 0, playerPosition.data.x - position.data.x, playerPosition.data.y - position.data.y];
          physics.intersectionsWithShape(position.data, 0, new Polyline(Float32Array.from(line)), (c) => {
            if (c.isSensor() || c === collider.rapierCollider || c === playerCollider.rapierCollider) return true;

            hit = true;
            return false;
          });

          renderable.visible = !hit;
        }
      });
    }
  })
})
