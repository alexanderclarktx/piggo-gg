import {
  ActionSystem, Chat, ClickableSystem, Cursor,
  DebugButton, DebugSystem, FullscreenButton,
  InputSystem, NPCSystem, Noob, PhysicsSystem,
  RenderSystem, World, WorldBuilder
} from "@piggo-gg/core";

export const IsometricWorld: WorldBuilder = (props) => {

  const playerId = `noob${Math.trunc((Math.random() * 100))}`;

  const world = World({ ...props, renderMode: "isometric", clientPlayerId: playerId });

  if (world.runtimeMode === "client") {
    // client systems
    world.addSystemBuilders([InputSystem, ClickableSystem, DebugSystem]);

    // ui
    world.addEntityBuilders([FullscreenButton, DebugButton, Cursor, Chat]);

    // client player
    if (world.clientPlayerId) world.addEntity(Noob({ id: world.clientPlayerId }));
  }

  // add shared systems
  world.addSystemBuilders([NPCSystem, ActionSystem, PhysicsSystem]);

  // render system runs last
  if (world.runtimeMode === "client") world.addSystemBuilders([RenderSystem]);

  return world;
}
