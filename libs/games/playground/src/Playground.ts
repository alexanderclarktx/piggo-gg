import {
  DebugSystem, InputSystem, ClickableSystem, WssNetcodeSystem, Networked, Player, PlayerSpawnSystem, RenderSystem,
  Ball, DebugButton, FpsText, FullscreenButton, Spaceship, PhysicsSystem, Cursor, Chat, Floor
} from "@piggo-legends/contrib";
import { Game, GameProps, Renderer } from "@piggo-legends/core";

const randomName = `player${(Math.random() * 100).toFixed(0)}`;

export class Playground extends Game {

  constructor(props: GameProps) {
    super(props);

    const renderer = props.renderer;

    this.addSystems([
      PhysicsSystem({ mode: "isometric" }),
      PlayerSpawnSystem({ renderer: renderer, thisPlayerId: randomName }),
    ]);

    // add client-only systems
    if (renderer) {
      this.addSystems([
        WssNetcodeSystem({ thisPlayerId: randomName }),
        ClickableSystem(renderer, randomName, "isometric"),
        RenderSystem({ renderer, mode: "isometric" }),
        DebugSystem(renderer, this),
        InputSystem(renderer, this.addEntity, randomName),
      ]);

      this.addUI(renderer);
      this.addFloor(renderer, 50, 50);
    }

    this.addPlayer();
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

  addUI = async (renderer: Renderer) => {
    this.addEntity(FpsText(renderer, { color: 0xffff00 }));
    this.addEntity(FullscreenButton(renderer));
    this.addEntity(DebugButton(renderer));
    this.addEntity(Cursor(renderer));
    this.addEntity(Chat(renderer));
  }

  addGameObjects = async () => {
    this.addEntity(Ball({ renderer: this.renderer }));
    this.addEntity(await Spaceship({ renderer: this.renderer }));
  }

  addFloor = async (renderer: Renderer, rows: number, cols: number) => {
    this.addEntity(await Floor(renderer, rows, cols));
  }
}
