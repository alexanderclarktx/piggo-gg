import {
  ActionSystem, ClickableSystem, CommandSystem,
  CooldownSystem, Cursor, DamageSystem, DebugSystem,
  GameCommand, InputSystem, NPCSystem, PhysicsSystem,
  RenderSystem, SpawnCommand, World, WorldBuilder, isMobile
} from "@piggo-gg/core";

export const IsometricWorld: WorldBuilder = (props) => {

  const world = World({
    ...props,
    commands: [GameCommand, SpawnCommand]
  });

  if (!isMobile()) world.addEntity(Cursor());

  world.addSystemBuilders([
    InputSystem, ClickableSystem, DebugSystem, DamageSystem,
    CommandSystem, NPCSystem, CooldownSystem, ActionSystem,
    PhysicsSystem, RenderSystem
  ]);

  return world;
}
