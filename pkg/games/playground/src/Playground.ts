import {
  DebugSystem, ControllerSystem, ClickableSystem, NetcodeSystem, Networked, Player, PlayerSpawnSystem, RenderSystem,
  Ball, DebugButton, FpsText, FullscreenButton, Spaceship, TileFloor, PhysicsSystem
} from "@piggo-legends/contrib";
import { Game, GameProps } from "@piggo-legends/core";

const randomName = `player${(Math.random() * 100).toFixed(0)}`;

export type PlaygroundProps = GameProps & {}

export class Playground extends Game<PlaygroundProps> {

  constructor(props: PlaygroundProps) {
    super({
      ...props,
      systems: [
        RenderSystem(props.renderer),
        DebugSystem(props.renderer),
        ControllerSystem(props.renderer, randomName),
        ClickableSystem(props.renderer, randomName),
        NetcodeSystem(props.renderer, props.net, randomName),
        PlayerSpawnSystem(props.renderer, randomName),
        PhysicsSystem(props.renderer)
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
        networked: new Networked({isNetworked: true}),
        player: new Player({name: randomName}),
      }
    });
  }

  addUI = async () => {
    this.addEntity(FpsText(this.props.renderer, {color: 0xffff00}));
    this.addEntity(FullscreenButton(this.props.renderer));
    this.addEntity(DebugButton(this.props.renderer));
  }

  addGameObjects = async () => {
    this.addEntity(await TileFloor(this.props.renderer));
    this.addEntity(Ball(this.props.renderer));
    this.addEntity(await Spaceship(this.props.renderer));
  }
}
