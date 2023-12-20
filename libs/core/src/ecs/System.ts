import { Entity, Game, GameProps } from "@piggo-legends/core";

// a System is a function that runs on every tick of the game loop
export interface System {
  componentTypeQuery: string[];
  onTick: (entities: Entity[], game: Game<GameProps>) => void;
}
