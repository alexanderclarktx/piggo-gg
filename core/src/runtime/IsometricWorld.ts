import {
  ActionSystem, ClickableSystem, CommandSystem,
  CooldownSystem, Cursor, DamageSystem, DebugSystem,
  GameCommand, InputSystem, NPCSystem, PhysicsSystem,
  RenderSystem, SpawnCommand, World, WorldBuilder,
  isMobile
} from "@piggo-gg/core";

export const IsometricWorld: WorldBuilder = (props) => {

  const playerId = `noob${Math.trunc((Math.random() * 100))}`;

  const world = World({
    ...props,
    clientPlayerId: playerId,
    commands: [GameCommand, SpawnCommand]
  });

  if (!isMobile()) {
    world.addEntities([Cursor()])
  }

  world.addSystemBuilders([
    InputSystem, ClickableSystem, DebugSystem, DamageSystem,
    CommandSystem, NPCSystem, CooldownSystem, ActionSystem,
    PhysicsSystem, RenderSystem
  ]);

  return world;
}
