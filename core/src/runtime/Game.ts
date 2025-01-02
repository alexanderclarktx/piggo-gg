import { Command, Entity, SystemBuilder, World } from "@piggo-gg/core"

// a game is a collection of entities and systems
export type Game<T extends string = string> = {
  id: T
  entities: Entity[]
  systems: SystemBuilder[]
  commands?: Command[]
  tileMap?: number[]
}

export type GameBuilder<T extends string = string> = {
  id: T
  init: (world: World) => Game<T>
}
