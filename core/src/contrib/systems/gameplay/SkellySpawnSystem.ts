import { Controlling, Entity, Player, SystemBuilder, spawnSkellyForNoob } from "@piggo-gg/core";

// SkellySpawnSystem handles spawning characters for players
export const SkellySpawnSystem: SystemBuilder<"SkellySpawnSystem"> = {
  id: "SkellySpawnSystem",
  init: ({ world }) => {

    const spawnedPlayers: string[] = [];

    return {
      id: "SkellySpawnSystem",
      query: ["player"],
      onTick: (players: Entity<Player | Controlling>[]) => {

        spawnedPlayers.forEach((playerId) => {
          if (!world.entities[playerId]) {
            world.removeEntity(`skelly-${playerId}`);
          }
        })

        players.forEach((player) => {
          if (!player.components.controlling.data.entityId) {
            world.actionBuffer.push(world.tick + 1, player.id, spawnSkellyForNoob(player));
            spawnedPlayers.push(player.id);
          }
        });
      }
    }
  }
}
