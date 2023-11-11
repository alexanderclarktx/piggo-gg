import { Entity, EntityProps, Game, GameProps, System, SystemProps } from "@piggo-legends/core";
import { Controlling, Position, Skelly } from "@piggo-legends/contrib";

export type PlayerSpawnSystemProps = SystemProps & {
  player: string
};

export class PlayerSpawnSystem extends System<PlayerSpawnSystemProps> {
  override componentTypeQuery = ["player"];
  player: string;
  playersWithCharacters: Record<string, Entity<EntityProps>> = {};

  constructor(props: PlayerSpawnSystemProps) {
    super(props);
    this.player = props.player;
  }

  onTick = (players: Entity<EntityProps>[], game: Game<GameProps>) => {
    for (const player of players) {
      if (!this.playersWithCharacters[player.id]) {
        this.spawnCharacterForPlayer(player, game, this.player === player.id ? 0xffffff : 0xffff00);
        this.playersWithCharacters[player.id] = player
      }
    }
  }

  spawnCharacterForPlayer = async (player: Entity<EntityProps>, game: Game<GameProps>, color: number) => {
    const characterForPlayer = await Skelly(this.props.renderer, `${player.id}-character`, color);

    // give the player control of the character
    player.components.controlling = new Controlling({ entityId: characterForPlayer.id });
    characterForPlayer.components.controlled = new Controlling({ entityId: player.id });
    game.addEntity(characterForPlayer);
    console.log("adding", characterForPlayer);

    if (this.player === player.id) {
      this.props.renderer.trackCamera((characterForPlayer.components.position as Position));
    }
  }
}
