import {
  ActionSystem, CommandSystem, ControlSystem, CooldownSystem, DebugCommand,
  ExpiresSystem, GameCommand, HealthSystem, InputSystem, NPCSystem, PlsCommand,
  PositionSystem, RandomSystem, RemoveCommand, SpawnCommand, World, WorldBuilder, WorldProps
} from "@piggo-gg/core"

export const DefaultWorld: WorldBuilder = (props: WorldProps) => World({
  ...props,
  commands: [GameCommand, SpawnCommand, DebugCommand, RemoveCommand, PlsCommand],
  systems: [
    RandomSystem, ExpiresSystem, ControlSystem, InputSystem, HealthSystem,
    CommandSystem, NPCSystem, CooldownSystem, ActionSystem, PositionSystem
  ]
})
