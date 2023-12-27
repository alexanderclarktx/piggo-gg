import {
  DebugSystem, InputSystem, ClickableSystem, WsNetcodeSystem, Networked, Player, PlayerSpawnSystem, RenderSystem,
  Ball, DebugButton, FpsText, FullscreenButton, Spaceship, PhysicsSystem, Cursor, Chat, TileFloor, CommandSystem,
} from "@piggo-legends/contrib";
import { Game, GameProps, Renderer } from "@piggo-legends/core";

const randomName = `player${(Math.random() * 100).toFixed(0)}`;

export class Playground extends Game {

  constructor(props: GameProps) {
    super(props);

    const renderer = props.renderer;

    this.addSystems([
      CommandSystem(this),
      PhysicsSystem({ mode: "isometric" }),
      PlayerSpawnSystem({ renderer: renderer, thisPlayerId: randomName }),
    ]);

    // add client-only systems
    if (renderer) {
      this.addSystems([
        InputSystem(renderer, this.addEntity, randomName),
        ClickableSystem(renderer, randomName, "isometric"),
        RenderSystem({ renderer, mode: "isometric", game: this }),
        DebugSystem(renderer, this),
        WsNetcodeSystem({ thisPlayerId: randomName }),
      ]);

      this.addUI(renderer);
      this.addFloor(renderer);
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
    this.addEntity(FpsText({}));
    this.addEntity(FullscreenButton());
    this.addEntity(DebugButton());
    this.addEntity(Cursor());
    this.addEntity(Chat());
  }

  addGameObjects = async () => {
    this.addEntity(Ball({ renderer: this.renderer }));
    this.addEntity(await Spaceship({ renderer: this.renderer }));
  }

  addFloor = async (renderer: Renderer) => {

    // single 30x30 board
    this.addEntity(await TileFloor({ rows: 30, cols: 30, position: { x: 0, y: 0 } }));

    // tiled sprite floor
    // this.addEntity(await TilingSpriteFloor(renderer, 200, 200));

    // four 30x30 boards
    // this.addEntity(await TileFloor({ renderer, rows: 30, cols: 30, position: { x: 0, y: 0 } }));
    // this.addEntity(await TileFloor({ renderer, rows: 30, cols: 30, position: { x: 424, y: 0 } }));
    // this.addEntity(await TileFloor({ renderer, rows: 30, cols: 30, position: { x: 0, y: 424 } }));
    // this.addEntity(await TileFloor({ renderer, rows: 30, cols: 30, position: { x: 424, y: 424 } }));
  }
}
