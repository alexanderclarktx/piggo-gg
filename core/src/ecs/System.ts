import { Entity, World, Renderer } from "@piggo-legends/core";

// 制 zhì (system)
// a System is a function that runs on every tick
export interface System {
  id: string,
  onTick: (entities: Entity[]) => void;
  data?: Record<string, string | number>
  onRender?: (entities: Entity[]) => void;
  query?: string[];
  skipOnRollback?: boolean
}

export type SystemProps = {
  world: World
  renderer: Renderer | undefined
  clientPlayerId: string | undefined
  mode: "cartesian" | "isometric"
};

export type SystemBuilder<T extends SystemProps = SystemProps> = (props: T) => System;
