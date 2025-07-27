import { Command, Entity, SystemBuilder, World } from "@piggo-gg/core"

export type Game<State extends {} = {}, ID extends string = string> = {
  id: ID
  bgColor?: number
  commands?: Command[]
  entities: Entity[]
  netcode: "rollback" | "delay"
  state: State
  systems: SystemBuilder[]
  tileMap?: number[]
}

export type GameBuilder<State extends {} = {}, T extends string = string> = {
  id: T
  init: (world: World) => Game<State, T>
}
