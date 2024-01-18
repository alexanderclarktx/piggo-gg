import {
  Ball, Chat, ClickableSystem, CommandSystem, Cursor, DebugButton, DebugSystem, EnemySpawnSystem, FpsText,
  FullscreenButton, Game, GameProps, GuiSystem, InputSystem, NPCSystem, Networked,
  PhysicsSystem, Player, PlayerSpawnSystem, RenderSystem, RtcNetcodeSystem, SpaceBackground, TileFloor, Wall
} from "@piggo-legends/core";

export class Playground extends Game {

  constructor(props: GameProps = {}) {
    super({ ...props, renderMode: "isometric" });

    // add shared systems
    this.addSystemBuilders([CommandSystem, PhysicsSystem, PlayerSpawnSystem, NPCSystem, EnemySpawnSystem]);

    // add client-only systems/entities
    if (props.renderer) {
      this.addSystemBuilders([InputSystem, ClickableSystem, DebugSystem, RenderSystem, RtcNetcodeSystem, GuiSystem]);
      this.addUI();
      this.addFloor();
      this.addWalls();
      this.addBackgroundImage();
    }

    this.addPlayer();
    this.addGameObjects();
  }

  addPlayer = () => {
    this.addEntity({
      id: this.thisPlayerId,
      components: {
        networked: new Networked({ isNetworked: true }),
        player: new Player({ name: this.thisPlayerId }),
      }
    });
  }

  addUI = async () => {
    this.addEntities([FpsText(), FullscreenButton(), DebugButton(), Cursor(), Chat()]);
  }

  addGameObjects = async () => {
    this.addEntity(Ball());
  }

  addFloor = async () => {
    this.addEntity(await TileFloor({ rows: 25, cols: 25, position: { x: 0, y: 0 } }));
  }

  addWalls = async () => {
    this.addEntities([
      Wall({ x: 420, y: -20, length: 850, width: 1 }),
      Wall({ x: 12, y: 380, length: 1, width: 850 }),
      Wall({ x: 420, y: 780, length: 850, width: 1 }),
      Wall({ x: 815, y: 380, length: 1, width: 850 })
    ]);
  }

  addBackgroundImage = () => {
    this.addEntity(SpaceBackground());
  }
}
