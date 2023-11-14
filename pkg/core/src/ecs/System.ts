import { Entity, Game, GameProps, Renderer } from "@piggo-legends/core";

export interface System {
  renderer: Renderer
  componentTypeQuery: string[];
  onTick: (entities: Entity[], game: Game<GameProps>) => void;
}
