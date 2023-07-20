import { Entity, EntityProps, Game, GameProps, System, SystemProps } from "@piggo-legends/core";
import { Actions, Character, CharacterMovement, Controller, Controlling, Interactive, Networked, Position, Renderable, playerControlsEntity } from "@piggo-legends/contrib";
import { AnimatedSprite, Assets } from "pixi.js";

export type PlayerSpawnSystemProps = SystemProps & {
  player: string
};

export class PlayerSpawnSystem extends System<PlayerSpawnSystemProps> {
  override componentTypeQuery = ["player"];
  player: string;
  assets: any; // TODO type this

  constructor(props: PlayerSpawnSystemProps) {
    super(props);
    this.player = props.player;
    this.init();
  }

  init = async () => {
    this.assets = await Assets.load("chars.json");
  }

  onTick = (players: Entity<EntityProps>[], game: Game<GameProps>) => {
    for (const player of players) {
      const controlling = player.components.controlling as Controlling;

      if (!controlling && this.assets) {
        // make the character
        let characterForPlayer;
        if (this.player === player.id) {
          characterForPlayer = this.makeCharacter(player, 0xffffff);
        } else {
          characterForPlayer = this.makeCharacter(player, 0xffff00);
        }

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
  }

  makeCharacter = (entity: Entity<EntityProps>, tint?: number) => {
    const character = new Entity({
      id: `${entity.id}-character`,
      components: {
        position: new Position(300, 300),
        networked: new Networked({ isNetworked: true }),
        interactive: new Interactive({
          width: 32,
          height: 32,
          active: true,
          onPress: "click"
        }),
        controller: new Controller({
          map: {
            "a,d": "", "w,s": "",
            "w,a": "upleft", "w,d": "upright", "s,a": "downleft", "s,d": "downright",
            "w": "up", "s": "down", "a": "left", "d": "right"
          }
        }),
        actions: new Actions({
          ...CharacterMovement,
          "click": playerControlsEntity
        }),
        renderable: new Character({
          renderer: this.props.renderer,
          animations: {
            d: new AnimatedSprite([this.assets.textures["d1"], this.assets.textures["d2"], this.assets.textures["d3"]]),
            u: new AnimatedSprite([this.assets.textures["u1"], this.assets.textures["u2"], this.assets.textures["u3"]]),
            l: new AnimatedSprite([this.assets.textures["l1"], this.assets.textures["l2"], this.assets.textures["l3"]]),
            r: new AnimatedSprite([this.assets.textures["r1"], this.assets.textures["r2"], this.assets.textures["r3"]]),
            dl: new AnimatedSprite([this.assets.textures["dl1"], this.assets.textures["dl2"], this.assets.textures["dl3"]]),
            dr: new AnimatedSprite([this.assets.textures["dr1"], this.assets.textures["dr2"], this.assets.textures["dr3"]]),
            ul: new AnimatedSprite([this.assets.textures["ul1"], this.assets.textures["ul2"], this.assets.textures["ul3"]]),
            ur: new AnimatedSprite([this.assets.textures["ur1"], this.assets.textures["ur2"], this.assets.textures["ur3"]])
          },
          track: true,
          scale: 2,
          zIndex: 2,
          tintColor: tint ?? 0xffffff
        })
      }
    });
    return character;
  }
}
