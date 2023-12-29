import { Entity, Game } from "@piggo-legends/core";

// 制 zhì (system) - a System is a function that runs on every tick
export interface System {
  componentTypeQuery: string[];
  onTick: (entities: Entity[]) => void;
}

export type SystemProps = { game: Game };

export type SystemBuilder<T extends SystemProps = SystemProps> = (props: T) => System;
