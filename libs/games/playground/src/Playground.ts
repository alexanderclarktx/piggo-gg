import {
  DebugSystem, InputSystem, ClickableSystem, NetcodeSystem, Networked, Player, PlayerSpawnSystem, RenderSystem,
  Ball, DebugButton, FpsText, FullscreenButton, Spaceship, PhysicsSystem, Cursor, Chat, Floor
} from "@piggo-legends/contrib";
import { Game, GameProps, Renderer } from "@piggo-legends/core";

const randomName = `player${(Math.random() * 100).toFixed(0)}`;

export class Playground extends Game {

  constructor(props: GameProps) {
    super(props);

    const renderer = props.renderer;

    this.addSystems([
      NetcodeSystem({ net: props.net, thisPlayerId: randomName }),
      PhysicsSystem({ mode: "isometric" }),
      PlayerSpawnSystem({ renderer: renderer, thisPlayerId: randomName }),
    ]);

    // add client-only systems
    if (renderer) {
      this.addSystems([
        ClickableSystem(renderer, randomName, "isometric"),
        RenderSystem({ renderer, mode: "isometric" }),
        DebugSystem(renderer, this),
        InputSystem(renderer, this.addEntity, randomName),
      ]);

      this.addUI(renderer);
      this.addFloor(renderer, 100, 100);
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

    // tiling sprite 1
    // const tilingSprite = new TilingSprite((await Assets.load("sandbox.json")).textures["white_small"], 32 * 500, 16 * 500);
    // tilingSprite.scale.set(2);
    // tilingSprite.tint = 0x8888ff;

    // tiling sprite 2
    // const tilingSprite2 = new TilingSprite((await Assets.load("sandbox.json")).textures["white_small"], 32 * 500, 16 * 500);
    // tilingSprite2.position.set(16, 8);
    // tilingSprite2.tint = 0x8888ff;
    // tilingSprite.addChild(tilingSprite2);

    // this.addEntity({
    //   id: "abc",
    //   components: {
    //     position: new Position({ x: -10000, y: -5000 }),
    //     renderable: new Renderable({
    //       renderer: this.renderer,
    //       container: tilingSprite
    //     })
    //   }
    // })
  }
}
