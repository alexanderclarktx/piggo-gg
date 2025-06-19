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
        "w": () => ({ actionId: "move", params: { key: "w" } }),
        "a": () => ({ actionId: "move", params: { key: "a" } }),
        "s": () => ({ actionId: "move", params: { key: "s" } }),
        "d": () => ({ actionId: "move", params: { key: "d" } })
      }
    }),
    actions: Actions({
      move: Action("move", ({ entity, params, world }) => {
        const camera = world.three?.camera
        if (!camera) return

        if (!["a", "d", "w", "s"].includes(params.key)) return

        const dir = camera.worldDirection()
        const toward = new Vector3()

        if (params.key === "a") {
          toward.crossVectors(camera.c.up, dir).normalize() // left
        } else if (params.key === "d") {
          toward.crossVectors(dir, camera.c.up).normalize() // right
        } else if (params.key === "w") {
          toward.copy(dir).normalize() // forward
        } else if (params.key === "s") {
          toward.copy(dir).negate().normalize() // backward
        }

        entity?.components?.position?.setVelocity({
          x: toward.x,
          y: toward.z,
          z: toward.y
        })

        // console.log("move", params, entity?.components?.position?.data.x,
        //   entity?.components?.position?.data.y, entity?.components?.position?.data.z
        // )

        // if (!params.y) return
        // entity?.components?.position?.setVelocity({
        //   y: params.y, x: params.x, z: 0
        // })
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
