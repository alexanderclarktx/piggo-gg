import {
  Ball, Chat, ClickableSystem, CommandSystem, Cursor, DebugButton, DebugSystem, EnemySpawnSystem,
  FullscreenButton, GuiSystem, InputSystem, NPCSystem, Networked,
  PhysicsSystem, PiggoWorld, Player, PlayerSpawnSystem, RenderSystem,
  SpaceBackground, TileFloor, Wall, World, WorldProps, WsClientSystem
} from "@piggo-legends/core";

export type PlaygroundProps = Omit<WorldProps, "renderMode">;

export const Playground = (props: PlaygroundProps): World => {
  const world = PiggoWorld({ ...props, renderMode: "isometric", clientPlayerId: "player1" });

  if (world.runtimeMode === "client") {
    world.addSystemBuilders([
      InputSystem, ClickableSystem, DebugSystem, GuiSystem
    ]);

    // ui
    world.addEntityBuilders([FullscreenButton, DebugButton, Cursor, Chat]);

    // floor
    world.addEntity(TileFloor({ rows: 25, cols: 25, position: { x: 0, y: 0 } }));

    // background
    world.addEntity(SpaceBackground());

    // networked
    if (world.clientPlayerId) {
      console.log(`spawn player locally: ${world.clientPlayerId}`);
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
  world.addSystems([PlayerSpawnSystem(world), EnemySpawnSystem(world)]);
  world.addSystemBuilders([NPCSystem, CommandSystem, PhysicsSystem]);

  if (world.runtimeMode === "client") {
    world.addSystemBuilders([RenderSystem]);
    // TODO enable when netcode is stable
    // world.addSystemBuilders([WsClientSystem]);
  }

  // ball
  world.addEntity(Ball());

  // walls
  world.addEntities([
    Wall({ x: 420, y: -20, length: 420, width: 0 }),
    Wall({ x: 12, y: 380, length: 0, width: 420 }),
    Wall({ x: 420, y: 780, length: 420, width: 0 }),
    Wall({ x: 815, y: 380, length: 0, width: 420 })
  ]);

  return world;
}
