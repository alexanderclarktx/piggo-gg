import { Entity, World, Renderer } from "@piggo-gg/core";

// 制 zhì (system)
// a System is a function that runs on every tick
export interface System<T extends string = string> {
  id: T,
  data?: Record<string, string | number>
  query?: string[];
  skipOnRollback?: boolean
  onRender?: (entities: Entity[]) => void;
  onRemove?: () => void;
  onRollback?: () => void
  onTick: (entities: Entity[], isRollback: boolean) => void;
}

export type SystemProps = {
  world: World
  renderer: Renderer | undefined
  clientPlayerId: string | undefined
  mode: "cartesian" | "isometric"
};

export type SystemBuilder<T extends string = string> = {
  id: T,
  init: (props: SystemProps) => System<T>
}
