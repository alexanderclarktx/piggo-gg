import {
  Ball, Chat, ClickableSystem, CommandSystem, Cursor, DebugButton, DebugSystem, EnemySpawnSystem, FpsText,
  FullscreenButton, Game, GameProps, GuiSystem, InputSystem, NPCSystem, Networked,
  PhysicsSystem, Player, PlayerSpawnSystem, RenderSystem, SpaceBackground, TileFloor, Wall, WsNetcodeSystem
} from "@piggo-legends/core";

export class Playground extends Game {

  constructor(props: GameProps = {}) {
    super({ ...props, renderMode: "isometric" });


    // add shared systems
    this.addSystemBuilders([CommandSystem, PhysicsSystem, NPCSystem]);

    // add client-only systems/entities
    if (this.runtimeMode === "client") {
      this.addSystemBuilders([
        InputSystem, ClickableSystem, DebugSystem, RenderSystem, GuiSystem
      ]);

      this.addSystems([
        PlayerSpawnSystem(this),
        EnemySpawnSystem(this),
      ]);

      // not networked
      this.addUI();
      this.addFloor();
      this.addBackgroundImage();

      // networked
      this.addPlayer();
    }

    this.addWalls();
    this.addGameObjects();
  }

  addPlayer = () => {
    console.log(`ADDING LOCALLY ${this.thisPlayerId}`);
    this.addEntity({
      id: this.thisPlayerId,
      components: {
        networked: new Networked({ isNetworked: true }),
        player: new Player({ name: this.thisPlayerId }),
      }
    });
  }

  addUI = async () => {
    this.addEntityBuilders([FpsText, FullscreenButton, DebugButton, Cursor, Chat]);
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
