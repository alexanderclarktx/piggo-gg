import { Entity, NetworkedComponentData, ValidComponents, World } from "@piggo-gg/core"

// a System is a function that runs on every tick
export interface System<T extends string = string> {
  id: T,
  data?: NetworkedComponentData
  query: ValidComponents[]
  skipOnRollback?: boolean
  onTick?: (entities: Entity[], isRollback: boolean) => void
  onRollback?: () => void
  onRender?: (entities: Entity[], deltaMS: number) => void
}

export type SystemBuilder<T extends string = string> = {
  id: T,
  init: (world: World) => System<T> | undefined
}

export const ClientSystemBuilder = <T extends string = string>(builder: SystemBuilder<T>): SystemBuilder<T> => ({
  ...builder,
  init: (world: World) => {
    if (world.runtimeMode !== "client") return undefined
    return builder.init(world)
  }
})
