import {
  ActionSystem, ClickableSystem, CommandSystem, ControlSystem, CooldownSystem, DamageSystem,
  DebugCommand, DebugSystem, EffectsSystem, ExpiresSystem, GameCommand, InputSystem,
  ItemSystem, NPCSystem, NametagSystem, PhysicsSystem, PlsCommand, PositionSystem,
  RemoveCommand, RenderSystem, SpawnCommand, World, WorldBuilder, WorldProps
} from "@piggo-gg/core"
import { NameCommand } from "../ecs/commands/NameCommand"

export const DefaultWorld: WorldBuilder = (props: WorldProps) => World({
  ...props,
  commands: [GameCommand, SpawnCommand, NameCommand, DebugCommand, RemoveCommand, PlsCommand],
  systems: [
    ExpiresSystem, ControlSystem, ClickableSystem, InputSystem, DebugSystem, ItemSystem,
    DamageSystem, CommandSystem, NPCSystem, NametagSystem, CooldownSystem,
    PhysicsSystem, ActionSystem, EffectsSystem, PositionSystem, RenderSystem
  ]
})
