import { Entity, Game, GameProps, Renderer } from "@piggo-legends/core";

// a System is a function that runs on every tick of the game loop
export interface System {
  renderer: Renderer
  componentTypeQuery: string[];
  onTick: (entities: Entity[], game: Game<GameProps>) => void;
}
