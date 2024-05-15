import {
  ActionSystem, ClickableSystem, CommandSystem,
  ControlSystem, CooldownSystem, DamageSystem,
  DebugSystem, ExpiresSystem, GameCommand, InputSystem,
  NPCSystem, PhysicsSystem, RenderSystem, SpawnCommand,
  World, WorldBuilder
} from "@piggo-gg/core";

export const IsometricWorld: WorldBuilder = (props) => {

  const world = World({
    ...props,
    commands: [GameCommand, SpawnCommand]
  });

  world.addSystemBuilders([
    ExpiresSystem, ControlSystem, InputSystem, ClickableSystem, DebugSystem,
    DamageSystem, CommandSystem, NPCSystem, CooldownSystem,
    PhysicsSystem, ActionSystem, RenderSystem
  ]);

  return world;
}
