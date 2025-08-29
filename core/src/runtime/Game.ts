import { Entity, SystemBuilder, World } from "@piggo-gg/core"

export type Game<State extends {} = {}, Settings extends {} = {}> = {
  id: string

  entities: Entity[]
  systems: SystemBuilder[]

  netcode: "rollback" | "delay"
  settings: Settings
  state: State  
}

export type GameBuilder<State extends {} = {}, Settings extends {} = {}> = {
  id: string
  init: (world: World) => Game<State, Settings>
}
