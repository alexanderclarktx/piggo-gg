import {
  Action, Actions, Character, Collider, GameBuilder, Input, PhysicsSystem,
  Player, Position, SpawnSystem, TCameraSystem, Team
} from "@piggo-gg/core"
import { Vector3 } from "three"

const Guy = (player: Player) => Character({
  id: "guy",
  components: {
    position: Position({ velocityResets: 1 }),
    collider: Collider({
      shape: "ball",
      radius: 4
    }),
    input: Input({
      press: {
        "w": () => ({ actionId: "move", params: { x: 0, y: -1, z: -1 } }),
        "s": () => ({ actionId: "move", params: { x: 0, y: 1, z: 1 } }),
        "a": () => ({ actionId: "move", params: { x: -1, y: 0, z: 0 } }),
        "d": () => ({ actionId: "move", params: { x: 1, y: 0, z: 0 } })
      }
    }),
    actions: Actions({
      move: Action("move", ({ entity, params, world }) => {
        const camera = world.three?.camera
        if (!camera) return

        const dir = camera.worldDirection()

        if (!params.y) return
        entity?.components?.position?.setVelocity({
          y: params.y, x: params.x, z: 0
        })
      })
    }),
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
      systems: [
        SpawnSystem(Guy),
        PhysicsSystem("global"),
        PhysicsSystem("local"),
        TCameraSystem()
      ],
      entities: []
    }
  }
}
