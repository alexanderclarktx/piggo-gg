import {
  ActionSystem, Chat, ClickableSystem, ConnectButton, Cursor,
  DebugButton, DebugSystem, FullscreenButton,
  InputSystem, Joystick, NPCSystem, Noob, PhysicsSystem,
  RenderSystem, World, WorldBuilder
} from "@piggo-gg/core";

const isMobile = (): boolean => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

export const IsometricWorld: WorldBuilder = (props) => {

  const playerId = `noob${Math.trunc((Math.random() * 100))}`;

  const world = World({ ...props, renderMode: "isometric", clientPlayerId: playerId });

  if (world.runtimeMode === "client") {
    // client systems
    world.addSystemBuilders([InputSystem, ClickableSystem, DebugSystem]);

    // ui
    world.addEntityBuilders([FullscreenButton, DebugButton, Chat]);

    // mobile
    isMobile() ?
      world.addEntityBuilders([Joystick, ConnectButton]) :
      world.addEntityBuilders([Cursor]);

    // client player
    if (world.clientPlayerId) world.addEntity(Noob({ id: world.clientPlayerId }));
  }

  // add shared systems
  world.addSystemBuilders([NPCSystem, ActionSystem, PhysicsSystem]);

  // render system runs last
  if (world.runtimeMode === "client") world.addSystemBuilders([RenderSystem]);

  return world;
}
