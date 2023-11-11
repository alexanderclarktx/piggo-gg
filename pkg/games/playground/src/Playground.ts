import {
  DebugSystem, ControllerSystem, InteractiveSystem, NetcodeSystem, Networked, Player, PlayerSpawnSystem, RenderSystem,
  Ball, DebugButton, FpsText, FullscreenButton, Spaceship, TileFloor
} from "@piggo-legends/contrib";
import { Entity, Game, GameProps } from "@piggo-legends/core";

const randomName = `player${(Math.random() * 100).toFixed(0)}`;

export type PlaygroundProps = GameProps & {}

export class Playground extends Game<PlaygroundProps> {

  constructor(props: PlaygroundProps) {
    super({
      ...props,
      systems: [
        new RenderSystem({ renderer: props.renderer }),
        new DebugSystem({ renderer: props.renderer }),
        new ControllerSystem({ renderer: props.renderer, player: randomName }),
        new InteractiveSystem({ renderer: props.renderer, player: randomName }),
        new NetcodeSystem({ renderer: props.renderer, net: props.net, player: randomName }),
        new PlayerSpawnSystem({ renderer: props.renderer, player: randomName })
      ]
    });
    this.addPlayer();
    this.addUI();
    this.addGameObjects();
  }

  addPlayer = () => {
    this.addEntity(new Entity({
      id: randomName,
      components: {
        networked: new Networked({isNetworked: true}),
        player: new Player({name: randomName}),
      }
    }));
  }

  addUI = async () => {
    this.addEntity(FpsText(this.props.renderer));
    this.addEntity(FullscreenButton(this.props.renderer));
    this.addEntity(DebugButton(this.props.renderer));
  }

  addGameObjects = async () => {
    this.addEntity(await TileFloor(this.props.renderer));
    this.addEntity(Ball(this.props.renderer));
    this.addEntity(await Spaceship(this.props.renderer));
  }
}
