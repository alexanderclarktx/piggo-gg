import { Controlling, Entity, Player, Skelly, SystemBuilder, World } from "@piggo-gg/core";

// PlayerSpawnSystem handles spawning characters for players
export const PlayerSpawnSystem: SystemBuilder<"PlayerSpawnSystem"> = {
  id: "PlayerSpawnSystem",
  init: ({ world }) => {
    let playerCharacters: Record<string, Entity> = {};

    const spawnCharacterForPlayer = (player: Entity, world: World, color: number) => {
      const characterForPlayer = Skelly(`skelly-${player.id}`, color);

      // give the player control of the character
      player.components.controlling = new Controlling({ entityId: characterForPlayer.id });
      world.addEntity(characterForPlayer);
      return characterForPlayer;
    }

    return {
      id: "PlayerSpawnSystem",
      query: ["player"],
      onTick: (players: Entity<Player>[]) => {

        // despawn characters for players that have left
        for (const playerId in playerCharacters) {
          if (!players.find((player) => player.id === playerId)) {
            world.removeEntity(playerCharacters[playerId].id);
            delete playerCharacters[playerId];
          }
        }

        // check if character entity got removed
        Object.entries(playerCharacters).forEach(([playerId, character]) => {
          if (!world.entities[character.id]) {
            console.log("Character entity got removed", character.id);
            delete playerCharacters[playerId];
          }
        });

        // spawn characters for players
        players.forEach((player) => {
          if (!playerCharacters[player.id]) {
            // spawnCharacterForPlayer(player, world, world.client.playerId === player.id ? 0xffffff : 0xffff00);
            const character = spawnCharacterForPlayer(player, world, 0xffffff);
            playerCharacters[player.id] = character;
          }
        });
      }
    }
  }
}
