import { Controlled, Controlling, Entity, Player, Skelly, SystemBuilder, World } from "@piggo-gg/core";

// PlayerSpawnSystem handles spawning characters for players
export const PlayerSpawnSystem = SystemBuilder({
  id: "PlayerSpawnSystem",
  init: ({ world }) => {
    let playersWithCharacters: Record<string, Entity> = {};

    const onTick = (players: Entity<Player>[]) => {

      // despawn characters for players that have left
      for (const playerId in playersWithCharacters) {
        if (!players.find((player) => player.id === playerId)) {
          world.removeEntity(`skelly-${playerId}`);
          world.removeEntity(playersWithCharacters[playerId].id);
          delete playersWithCharacters[playerId];
        }
      }

      // spawn characters for players
      players.forEach((player) => {
        if (!playersWithCharacters[player.id]) {
          // spawnCharacterForPlayer(player, world, world.client.playerId === player.id ? 0xffffff : 0xffff00);
          spawnCharacterForPlayer(player, world, 0xffffff);
          playersWithCharacters[player.id] = player;
        }
      });
    }

    const spawnCharacterForPlayer = async (player: Entity, world: World, color: number) => {
      const characterForPlayer = Skelly(`skelly-${player.id}`, color);

      // give the player control of the character
      player.components.controlling = new Controlling({ entityId: characterForPlayer.id });
      characterForPlayer.components.controlled = new Controlled({ entityId: player.id });
      world.addEntity(characterForPlayer);
    }

    return {
      id: "PlayerSpawnSystem",
      query: ["player"],
      onTick
    }
  }
});
