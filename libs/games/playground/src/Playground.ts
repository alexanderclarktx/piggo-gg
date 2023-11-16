import {
  DebugSystem, ControllerSystem, ClickableSystem, NetcodeSystem, Networked, Player, PlayerSpawnSystem, RenderSystem,
  Ball, DebugButton, FpsText, FullscreenButton, Spaceship, TileFloor, PhysicsSystem
} from "@piggo-legends/contrib";
import { Game, GameProps } from "@piggo-legends/core";

const randomName = `player${(Math.random() * 100).toFixed(0)}`;

export class Playground extends Game {

  constructor(props: GameProps) {
    super({
      ...props,
      systems: [
        ClickableSystem(props.renderer, randomName),
        ControllerSystem(props.renderer, randomName),
        DebugSystem(props.renderer),
        NetcodeSystem(props.renderer, props.net, randomName),
        PhysicsSystem(props.renderer),
        PlayerSpawnSystem(props.renderer, randomName),
        RenderSystem(props.renderer),
      ]
    });

    this.addPlayer();
    this.addUI();
    this.addGameObjects();
  }

  addPlayer = () => {
    this.addEntity({
      id: randomName,
      components: {
        networked: new Networked({ isNetworked: true }),
        player: new Player({ name: randomName }),
      }
    });
  }

  addUI = async () => {
    this.addEntity(FpsText(this.renderer, { color: 0xffff00 }));
    this.addEntity(FullscreenButton(this.renderer));
    this.addEntity(DebugButton(this.renderer));
  }

  addGameObjects = async () => {
    this.addEntity(Ball(this.renderer));
    this.addEntity(await TileFloor(this.renderer));
    this.addEntity(await Spaceship(this.renderer));
  }
}
