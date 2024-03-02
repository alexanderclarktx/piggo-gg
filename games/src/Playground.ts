import {
  Ball, Chat, ClickableSystem, ActionSystem, Cursor, DebugButton, DebugSystem, EnemySpawnSystem,
  FullscreenButton, Goal, GuiSystem, InputSystem, NPCSystem,
  PhysicsSystem, PiggoWorld, Noob,
  PlayerSpawnSystem, RenderSystem,
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

    // player
    if (world.clientPlayerId) world.addEntity(Noob({ id: world.clientPlayerId }));
  }

  // add shared systems
  world.addSystemBuilders([PlayerSpawnSystem, EnemySpawnSystem, NPCSystem, ActionSystem, PhysicsSystem]);

  // render system
  if (world.runtimeMode === "client") world.addSystemBuilders([RenderSystem]);

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
