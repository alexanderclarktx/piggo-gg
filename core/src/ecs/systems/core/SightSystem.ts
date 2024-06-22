import { Entity, Renderable, SystemBuilder, Team } from "@piggo-gg/core";

export const SightSystem: SystemBuilder<"SightSystem"> = {
  id: "SightSystem",
  init: ({ world }) => {

    return {
      id: "SightSystem",
      query: ["team", "renderable"],
      onTick: (entities: Entity<Team | Renderable>[]) => {

        const player = world.client?.playerEntity;
        if (!player) return;

        const { team: playerTeam } = player.components.team.data;

        entities.forEach((entity) => {
          const { team, renderable } = entity.components;

          if (team.data.team === playerTeam) {
            renderable.c.alpha = 1;
            renderable.visible = true;
          } else {
            renderable.c.alpha = 0.5;
            renderable.visible = false;
          }
        });
      }
    }

  }
}
