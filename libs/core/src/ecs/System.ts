import { Entity, Game, GameProps } from "@piggo-legends/core";

// 制 zhì (system) - a System is a function that runs on every tick
export interface System {
  componentTypeQuery: string[];
  onTick: (entities: Entity[], game: Game<GameProps>) => void;
}
