import {
  ActionSystem, ClickableSystem, CommandSystem, ControlSystem, CooldownSystem,
  DamageSystem, DebugCommand, DebugSystem, EffectsSystem, ExpiresSystem,
  GameCommand, InputSystem, InventorySystem, NPCSystem, NametagSystem, PhysicsSystem,
  PositionSystem, RenderSystem, SpawnCommand, World, WorldBuilder
} from "@piggo-gg/core"
import { NameCommand } from "../ecs/commands/NameCommand"

export const DefaultWorld: WorldBuilder = (props) => World({
  ...props,
  commands: [GameCommand, SpawnCommand, NameCommand, DebugCommand],
  systems: [
    ExpiresSystem, ControlSystem, ClickableSystem, InputSystem, DebugSystem,
    DamageSystem, CommandSystem, NPCSystem, NametagSystem, CooldownSystem, InventorySystem,
    PhysicsSystem, ActionSystem, EffectsSystem, PositionSystem, RenderSystem
  ]
})
