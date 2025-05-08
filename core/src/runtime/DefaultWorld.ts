import {
  ActionSystem, ClickableSystem, CommandSystem, ControlSystem, CooldownSystem,
  DebugCommand, DebugSystem, EffectsSystem, ExpiresSystem, GameCommand, HealthSystem, InputSystem,
  ItemSystem, NPCSystem, NametagSystem, PhysicsSystem, PlsCommand, PositionSystem, RandomSystem,
  RemoveCommand, RenderSystem, SpawnCommand, World, WorldBuilder, WorldProps
} from "@piggo-gg/core"

export const DefaultWorld: WorldBuilder = (props: WorldProps) => World({
  ...props,
  commands: [GameCommand, SpawnCommand, DebugCommand, RemoveCommand, PlsCommand],
  systems: [
    RandomSystem, ExpiresSystem, ControlSystem, ClickableSystem, InputSystem, DebugSystem, ItemSystem,
    HealthSystem, CommandSystem, NPCSystem, NametagSystem, CooldownSystem,
    PhysicsSystem, ActionSystem, EffectsSystem, PositionSystem, RenderSystem
  ]
})
