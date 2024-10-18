import {
  ActionSystem, ClickableSystem, CommandSystem, ControlSystem, CooldownSystem,
  DamageSystem, DebugCommand, DebugSystem, EffectsSystem, ExpiresSystem,
  GameCommand, InputSystem, InventorySystem, NPCSystem, NametagSystem, PhysicsSystem,
  PositionSystem, RenderSystem, SpawnCommand, World, WorldBuilder
} from "@piggo-gg/core";
import { NameCommand } from "../ecs/commands/NameCommand";

export const IsometricWorld: WorldBuilder = (props) => {

  const world = World({
    ...props,
    commands: [GameCommand, SpawnCommand, NameCommand, DebugCommand]
  });

  world.addSystemBuilders([
    ExpiresSystem, ControlSystem, ClickableSystem, InputSystem, DebugSystem,
    DamageSystem, CommandSystem, NPCSystem, NametagSystem, CooldownSystem, InventorySystem,
    PhysicsSystem, ActionSystem, EffectsSystem, PositionSystem, RenderSystem
  ]);

  return world;
}
