import { Entity, System } from "@piggo-gg/core";

// a game is a collection of entities and systems
export type Game = {
  entities: Entity[]
  systems: System[]
}

export type GameBuilder = () => Game;
