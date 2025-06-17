import { GameBuilder } from "@piggo-gg/core";

export const Experiment: GameBuilder = {
  id: "3D",
  init: (world) => {

    world.renderer?.deactivate()
    world.three?.activate()

    return {
      id: "3D",
      netcode: "rollback",
      state: {},
      systems: [],
      entities: []
    }
  }
}
