import {
  DebugSystem, InputSystem, ClickableSystem, NetcodeSystem, Networked, Player, PlayerSpawnSystem, RenderSystem,
  Ball, DebugButton, FpsText, FullscreenButton, Spaceship, FloorTile, PhysicsSystem, Cursor, Chat
} from "@piggo-legends/contrib";
import { Game, GameProps } from "@piggo-legends/core";

const randomName = `player${(Math.random() * 100).toFixed(0)}`;

export class Playground extends Game {

  constructor(props: GameProps) {
    super({
      ...props,
      systems: [
        ClickableSystem(props.renderer, randomName, "isometric"),
        InputSystem(props.renderer, randomName),
        DebugSystem(props.renderer),
        NetcodeSystem(props.renderer, props.net, randomName),
        PhysicsSystem(props.renderer, "isometric"),
        PlayerSpawnSystem(props.renderer, randomName),
        RenderSystem(props.renderer, "isometric"),
      ]
    });

    this.addPlayer();
    this.addUI();
    this.addGameObjects();
    this.addFloor(25, 25);
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
    this.addEntity(Cursor(this.renderer));
    this.addEntity(Chat(this.renderer));
  }

  addGameObjects = async () => {
    this.addEntity(Ball(this.renderer));
    this.addEntity(await Spaceship(this.renderer));
  }

  addFloor = async (rows: number, cols: number) => {
    for (let x = 0; x < rows; x++) {
      for (let y = 0; y < cols; y++) {
        this.addEntity(await FloorTile(this.renderer, { x, y }));
      }
    }
  }
}
