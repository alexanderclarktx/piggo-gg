import { Controlling, Entity, Player, SystemBuilder, spawnSkellyForNoob } from "@piggo-gg/core";

// PlayerSpawnSystem handles spawning characters for players
export const PlayerSpawnSystem: SystemBuilder<"PlayerSpawnSystem"> = {
  id: "PlayerSpawnSystem",
  init: ({ world }) => ({
    id: "PlayerSpawnSystem",
    query: ["player"],
    onTick: (players: Entity<Player | Controlling>[]) => {
      players.forEach((player) => {
        if (!player.components.controlling.data.entityId) {
          world.actionBuffer.push(world.tick + 1, player.id, spawnSkellyForNoob(player));
        }
      });
    }
  })
}
