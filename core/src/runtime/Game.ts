import { Command, Entity, SystemBuilder, World } from "@piggo-gg/core"

export type Game<T extends string = string> = {
  id: T
  entities: Entity[]
  systems: SystemBuilder[]
  commands?: Command[]
  tileMap?: number[]
  bgColor?: number
  view?: "top" | "side"
}

export type GameBuilder<T extends string = string> = {
  id: T
  init: (world: World) => Game<T>
}
