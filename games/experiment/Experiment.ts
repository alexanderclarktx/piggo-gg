import { Actions, Character, Collider, Entity, GameBuilder, Input, Player, Position, SpawnSystem, Team } from "@piggo-gg/core";

const Guy = (player: Player) => Character({
  id: "guy",
  components: {
    position: Position(),
    collider: Collider({
      shape: "ball"
    }),
    input: Input({

    }),
    actions: Actions(),
    team: Team(1)
  }
})

export const Experiment: GameBuilder = {
  id: "3D",
  init: (world) => {

    world.renderer?.deactivate()
    world.three?.activate()

    return {
      id: "3D",
      netcode: "rollback",
      state: {},
      systems: [SpawnSystem(Guy)],
      entities: []
    }
  }
}
