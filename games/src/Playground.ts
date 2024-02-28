import {
  Ball, Chat, ClickableSystem, CommandSystem, Cursor, DebugButton, DebugSystem, EnemySpawnSystem,
  FullscreenButton, Goal, GuiSystem, InputSystem, NPCSystem, Networked,
  PhysicsSystem, PiggoWorld, Playa, Player, PlayerSpawnSystem, RenderSystem,
  SpaceBackground, TileFloor, Wall,
  WorldBuilder
} from "@piggo-legends/core";

export const Playground: WorldBuilder = (props) => {
  const world = PiggoWorld({ ...props, renderMode: "isometric", clientPlayerId: `player${Math.trunc((Math.random() * 100))}` });

  if (world.runtimeMode === "client") {
    // client systems
    world.addSystemBuilders([InputSystem, ClickableSystem, DebugSystem, GuiSystem]);

    // ui
    world.addEntityBuilders([FullscreenButton, DebugButton, Cursor, Chat]);

    // floor
    world.addEntity(TileFloor({ rows: 25, cols: 25, position: { x: 0, y: 0 } }));

    // background
    world.addEntity(SpaceBackground());

    // networked
    if (world.clientPlayerId) {
      world.addEntity(Playa({ id: world.clientPlayerId }));
      //   {
      //   id: world.clientPlayerId,
      //   components: {
      //     networked: new Networked({ isNetworked: true }),
      //     player: new Player({ name: world.clientPlayerId }),
      //   }
      // });
    }
  }

  // add shared systems
  world.addSystemBuilders([PlayerSpawnSystem, EnemySpawnSystem, NPCSystem, CommandSystem, PhysicsSystem]);

  // rendering
  if (world.runtimeMode === "client") {
    world.addSystemBuilders([RenderSystem]);
  }

  // ball
  world.addEntity(Ball({ position: { x: 350, y: 350 } }));

  // goals
  world.addEntity(Goal({ id: "goal1", color: 0xff0000, position: { x: 200, y: 500 }, width: 100, length: 2 }));
  world.addEntity(Goal({ id: "goald2", color: 0x0000ff, position: { x: 500, y: 200 }, width: 100, length: 2 }));

  // walls
  world.addEntities([
    Wall({ x: 420, y: -20, length: 420, width: 0 }),
    Wall({ x: 12, y: 380, length: 0, width: 420 }),
    Wall({ x: 420, y: 780, length: 420, width: 0 }),
    Wall({ x: 815, y: 380, length: 0, width: 420 })
  ]);

  return world;
}
