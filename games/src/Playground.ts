import {
  Ball, Chat, ClickableSystem, CommandSystem, Cursor, DebugButton, DebugSystem, EnemySpawnSystem, FpsText,
  FullscreenButton, GuiSystem, InputSystem, NPCSystem, Networked,
  PhysicsSystemRJS, PiggoWorld, Player, PlayerSpawnSystem, RenderSystem,
  SpaceBackground, TileFloor, Wall, World, WorldProps, WsClientSystem
} from "@piggo-legends/core";

export type PlaygroundProps = Omit<WorldProps, "renderMode">;

export const Playground = (props: PlaygroundProps): World => {
  const world = PiggoWorld({ ...props, renderMode: "isometric", clientPlayerId: "player1" });

  if (world.runtimeMode === "client") {
    world.addSystemBuilders([
      InputSystem, ClickableSystem, DebugSystem, GuiSystem
    ]);

    console.log("ssytemss");
    world.addSystems([
      PlayerSpawnSystem(world),
      EnemySpawnSystem(world),
    ]);

    // ui
    world.addEntityBuilders([FpsText, FullscreenButton, DebugButton, Cursor, Chat]);

    // floor
    world.addEntity(TileFloor({ rows: 25, cols: 25, position: { x: 0, y: 0 } }));

    // background
    world.addEntity(SpaceBackground());

    // networked
    if (world.clientPlayerId) {
      console.log(`ADDING LOCALLY ${world.clientPlayerId}`);
      world.addEntity({
        id: world.clientPlayerId,
        components: {
          networked: new Networked({ isNetworked: true }),
          player: new Player({ name: world.clientPlayerId }),
        }
      });
    }
  }

  // add shared systems
  world.addSystemBuilders([NPCSystem, CommandSystem, PhysicsSystemRJS]);

  if (world.runtimeMode === "client") {
    world.addSystemBuilders([RenderSystem]);
    // TODO enable when netcode is stable
    // world.addSystemBuilders([WsClientSystem]);
  }

  // ball
  world.addEntity(Ball());

  // walls
  world.addEntities([
    Wall({ x: 420, y: -20, length: 850, width: 1 }),
    Wall({ x: 12, y: 380, length: 1, width: 850 }),
    Wall({ x: 420, y: 780, length: 850, width: 1 }),
    Wall({ x: 815, y: 380, length: 1, width: 850 })
  ]);

  return world;
}
