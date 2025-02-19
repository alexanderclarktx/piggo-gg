import {
  ActionSystem, ClickableSystem, CommandSystem, ControlSystem, CooldownSystem, DamageSystem,
  DebugCommand, DebugSystem, EffectsSystem, ExpiresSystem, GameCommand, HealthSystem, InputSystem,
  ItemSystem, NPCSystem, NametagSystem, PhysicsSystem, PlsCommand, PositionSystem, RandomSystem,
  RemoveCommand, RenderSystem, SpawnCommand, World, WorldBuilder, WorldProps
} from "@piggo-gg/core"
import { NameCommand } from "../ecs/commands/NameCommand"

export const DefaultWorld: WorldBuilder = (props: WorldProps) => World({
  ...props,
  commands: [GameCommand, SpawnCommand, NameCommand, DebugCommand, RemoveCommand, PlsCommand],
  systems: [
    RandomSystem, ExpiresSystem, ControlSystem, ClickableSystem, InputSystem, DebugSystem, ItemSystem,
    HealthSystem, DamageSystem, CommandSystem, NPCSystem, NametagSystem, CooldownSystem,
    PhysicsSystem, ActionSystem, EffectsSystem, PositionSystem, RenderSystem
  ]
})
