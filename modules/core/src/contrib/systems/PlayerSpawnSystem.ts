import { Entity, Game, SystemBuilder, Controlled, Controlling, Skelly, System, Player } from "@piggo-legends/core";

// PlayerSpawnSystem handles spawning characters for players
export const PlayerSpawnSystem = (game: Game): System => {
  let playersWithCharacters: Record<string, Entity> = {};

  const onTick = (players: Entity<Player>[]) => {
    // despawn characters for players that have left
    for (const playerId in playersWithCharacters) {
      if (!players.find((player) => player.id === playerId)) {
        console.log("despawning character for player", playerId);
        game.removeEntity(`skelly-${playerId}`);
        game.removeEntity(playersWithCharacters[playerId].id);
        delete playersWithCharacters[playerId];
      }
    }

    // spawn characters for players
    players.forEach((player) => {
      if (!playersWithCharacters[player.id]) {
        // spawnCharacterForPlayer(player, game, thisPlayerId === player.id ? 0xffffff : 0xffff00);
        spawnCharacterForPlayer(player, game, 0xffffff);
        playersWithCharacters[player.id] = player
      }
    });
  }

  const spawnCharacterForPlayer = async (player: Entity, game: Game, color: number) => {
    const characterForPlayer = Skelly(`skelly-${player.id}`, color);

    // give the player control of the character
    player.components.controlling = new Controlling({ entityId: characterForPlayer.id });
    characterForPlayer.components.controlled = new Controlled({ entityId: player.id });
    game.addEntity(characterForPlayer);
  }

  return {
    componentTypeQuery: ["player"],
    onTick
  }
}
