import {
  ActionSystem, Chat, ClickableSystem, CommandSystem, ConnectButton, Cursor,
  DebugButton, DebugSystem, FullscreenButton, GameCommand,
  InputSystem, Joystick, NPCSystem, Noob, PhysicsSystem,
  RenderSystem, World, WorldBuilder
} from "@piggo-gg/core";

const isMobile = (): boolean => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

export const IsometricWorld: WorldBuilder = (props) => {

  const playerId = `noob${Math.trunc((Math.random() * 100))}`;

  const world = World({
    ...props,
    renderMode: "isometric",
    clientPlayerId: playerId,
    commands: [GameCommand]
  });

  world.addSystemBuilders([
    InputSystem, ClickableSystem, DebugSystem,
    CommandSystem, NPCSystem, ActionSystem, PhysicsSystem,
    RenderSystem
  ]);

  if (world.runtimeMode === "client") {
    world.addEntity(Noob({ id: playerId }));

    world.addEntityBuilders([FullscreenButton, DebugButton, Chat]);

    isMobile() ?
      world.addEntityBuilders([Joystick, ConnectButton]) :
      world.addEntityBuilders([Cursor]);
  }

  return world;
}
