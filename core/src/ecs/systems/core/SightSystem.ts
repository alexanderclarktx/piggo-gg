import { ClientSystemBuilder, Entity, Renderable, Team } from "@piggo-gg/core";

export const SightSystem = ClientSystemBuilder({
  id: "SightSystem",
  init: ({ client }) => {

    return {
      id: "SightSystem",
      query: ["team", "renderable"],
      onTick: (entities: Entity<Team | Renderable>[]) => {

        const player = client?.playerEntity;
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
});
