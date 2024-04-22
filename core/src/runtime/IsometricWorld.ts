import {
  AbilityHUD, ActionSystem, Chat, ClickableSystem, CommandSystem, ConnectButton, CooldownSystem, Cursor,
  DamageSystem, DebugButton, DebugSystem, FullscreenButton, GameCommand,
  InputSystem, Joystick, NPCSystem, Noob, PhysicsSystem,
  RenderSystem, SpawnCommand, World, WorldBuilder
} from "@piggo-gg/core";

const isMobile = (): boolean => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

export const IsometricWorld: WorldBuilder = (props) => {

  const playerId = `noob${Math.trunc((Math.random() * 100))}`;

  const world = World({
    ...props,
    clientPlayerId: playerId,
    commands: [GameCommand, SpawnCommand]
  });

  world.addSystemBuilders([
    InputSystem, ClickableSystem, DebugSystem, DamageSystem,
    CommandSystem, NPCSystem, CooldownSystem, ActionSystem,
    PhysicsSystem, RenderSystem
  ]);

  if (world.runtimeMode === "client") {
    world.addEntity(Noob({ id: playerId }));

    world.addEntityBuilders([FullscreenButton, DebugButton, Chat]);

    isMobile() ?
      world.addEntityBuilders([Joystick, ConnectButton]) :
      world.addEntityBuilders([Cursor, AbilityHUD]);
  }

  return world;
}
