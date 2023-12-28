import {
  DebugSystem, InputSystem, ClickableSystem, WsNetcodeSystem, Networked, Player, PlayerSpawnSystem, RenderSystem,
  Ball, DebugButton, FpsText, FullscreenButton, Spaceship, PhysicsSystem, Cursor, Chat, TileFloor, CommandSystem,
} from "@piggo-legends/contrib";
import { Game, GameProps } from "@piggo-legends/core";

const randomName = `player${(Math.random() * 100).toFixed(0)}`;

export class Playground extends Game {

  constructor(props: GameProps) {
    super(props);

    const renderer = props.renderer;

    this.addSystems([
      CommandSystem(this),
      PhysicsSystem({ mode: "isometric" }),
      PlayerSpawnSystem({ thisPlayerId: randomName }),
    ]);

    // add client-only systems
    if (renderer) {
      this.addSystems([
        InputSystem(this.addEntity, randomName),
        ClickableSystem(renderer, randomName, "isometric"),
        RenderSystem({ renderer, mode: "isometric", game: this }),
        DebugSystem(renderer, this),
        WsNetcodeSystem({ thisPlayerId: randomName }),
      ]);

      this.addUI();
      this.addFloor();
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

  addUI = async () => {
    this.addEntity(FpsText());
    this.addEntity(FullscreenButton());
    this.addEntity(DebugButton());
    this.addEntity(Cursor());
    this.addEntity(Chat());
  }

  addGameObjects = async () => {
    this.addEntity(Ball());
    this.addEntity(await Spaceship());
  }

  addFloor = async () => {
    this.addEntity(await TileFloor({ rows: 30, cols: 30, position: { x: 0, y: 0 } }));
  }
}
