import { ComponentTypes, Entity, NetworkedComponentData, ValidComponents, World } from "@piggo-gg/core"

// a System is a function that runs on every tick
export interface System<T extends string = string> {
  id: T,
  query: ValidComponents[]
  priority: number
  data?: NetworkedComponentData
  skipOnRollback?: boolean
  onTick?: (entities: Entity[], isRollback: boolean) => void
  onRender?: (entities: Entity[], deltaMS: number) => void
  onRollback?: () => void
}

export type SystemBuilder<T extends string = string> = {
  id: T,
  init: (world: World) => System<T> | undefined
}

export const SystemBuilder = <T extends string = string>(builder: SystemBuilder<T>): SystemBuilder<T> => builder

export const ClientSystemBuilder = <T extends string = string>(builder: SystemBuilder<T>): SystemBuilder<T> => ({
  ...builder,
  init: (world: World) => {
    return (world.mode === "client") ? builder.init(world) : undefined
  }
})
