import { Controlling, Entity, Player, SystemBuilder, Team, spawnSkellyForNoob } from "@piggo-gg/core";

const teamColors = [0xffffff, 0x00ffff];

export const StrikeSystem: SystemBuilder<"StrikeSystem"> = {
  id: "StrikeSystem",
  init: ({ world }) => {
    return {
      id: "StrikeSystem",
      query: ["player"],
      onTick: (players: Entity<Player | Controlling | Team>[]) => {
        players.forEach((player) => {

          if (!player.components.team) {
            player.components.team = new Team({ team: 0 });
          }

          const team = player.components.team.data.team as number;

          if (!player.components.controlling.data.entityId) {
            world.actionBuffer.push(world.tick + 1, player.id, spawnSkellyForNoob(player, teamColors[team]));
          }
        });
      }
    }
  }
}
