import { Entity, Game, Renderer, SystemBuilder, SystemProps } from "@piggo-legends/core";
import { Controlling, Skelly } from "@piggo-legends/contrib";

export type PlayerSpawnSystemProps = SystemProps & {
  renderer?: Renderer | undefined,
  thisPlayerId: string
}

// PlayerSpawnSystem handles spawning characters for players
export const PlayerSpawnSystem: SystemBuilder<PlayerSpawnSystemProps> = ({ game, thisPlayerId }) => {
  let componentTypeQuery = ["player"];
  let playersWithCharacters: Record<string, Entity> = {};

  const onTick = (players: Entity[]) => {
    players.forEach((player) => {
      if (!playersWithCharacters[player.id]) {
        spawnCharacterForPlayer(player, game, thisPlayerId === player.id ? 0xffffff : 0xffff00);
        playersWithCharacters[player.id] = player
      }
    });
  }

  const spawnCharacterForPlayer = async (player: Entity, game: Game, color: number) => {
    const characterForPlayer = await Skelly(`${player.id}-character`, color);

    // give the player control of the character
    player.components.controlling = new Controlling({ entityId: characterForPlayer.id });
    characterForPlayer.components.controlled = new Controlling({ entityId: player.id });
    game.addEntity(characterForPlayer);
  }

  return {
    componentTypeQuery,
    onTick
  }
}
