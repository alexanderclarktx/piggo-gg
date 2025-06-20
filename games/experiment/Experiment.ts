import {
  Action, Actions, Character, Collider, GameBuilder, Input,
  PhysicsSystem, Position, SpawnSystem, TCameraSystem, Team
} from "@piggo-gg/core"
import { Vector3 } from "three"

const Guy = () => Character({
  id: "guy",
  components: {
    position: Position({ velocityResets: 1, gravity: 0.001, stop: 0.7, z: 1, x: 0, y: 2 }),
    collider: Collider({
      shape: "ball",
      radius: 4
    }),
    input: Input({
      press: {
        "w": () => ({ actionId: "move", params: { key: "w" } }),
        "a": () => ({ actionId: "move", params: { key: "a" } }),
        "s": () => ({ actionId: "move", params: { key: "s" } }),
        "d": () => ({ actionId: "move", params: { key: "d" } }),
        " ": () => ({ actionId: "move", params: { key: "up" } })
      }
    }),
    actions: Actions({
      move: Action("move", ({ entity, params, world }) => {
        const camera = world.three?.camera
        if (!camera) return

        const { position } = entity?.components ?? {}
        if (!position) return

        if (!["a", "d", "w", "s", "up"].includes(params.key)) return

        const dir = camera.worldDirection()
        const toward = new Vector3()

        let setZ = false

        if (params.key === "a") {
          toward.crossVectors(camera.c.up, dir).normalize()
        } else if (params.key === "d") {
          toward.crossVectors(dir, camera.c.up).normalize()
        } else if (params.key === "w") {
          toward.copy(dir).normalize()
        } else if (params.key === "s") {
          toward.copy(dir).negate().normalize()
        } else if (params.key === "up") {
          if (!position.data.standing) return
          toward.set(0, 0.03, 0)
          setZ = true
        }

        position.setVelocity({ x: toward.x, y: toward.z })
        if (setZ) position.setVelocity({ z: toward.y })
      })
    }),
    team: Team(1)
  }
})

export const Experiment: GameBuilder = {
  id: "3D",
  init: (world) => {

    world.renderer?.deactivate()
    world.three?.activate(world)

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
