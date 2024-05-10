import { Entity, World, Renderer, NetworkedComponentData } from "@piggo-gg/core";

// 制 zhì (system)
// a System is a function that runs on every tick
export interface System<T extends string = string> {
  id: T,
  data?: NetworkedComponentData
  query: string[];
  skipOnRollback?: boolean
  onTick: (entities: Entity[], isRollback: boolean) => void;
  onRollback?: () => void
  onBeforeTick?: (entities: Entity[]) => void;
  onRender?: (entities: Entity[], deltaMS: number) => void;
}

export type SystemProps = {
  world: World
}

export type SystemBuilder<T extends string = string> = {
  id: T,
  init: (props: SystemProps) => System<T> | undefined
}

export const ClientSystemBuilder = <T extends string = string>(builder: SystemBuilder<T>): SystemBuilder<T> => ({
  ...builder,
  init: (props: SystemProps) => {
    if (props.world.runtimeMode !== "client") return undefined;
    return builder.init(props);
  }
})
