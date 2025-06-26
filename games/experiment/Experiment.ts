import {
  Action, Actions, Character, Collider, GameBuilder, Input, min, Networked,
  PhysicsSystem, Position, SpawnSystem, TCameraSystem, Team
} from "@piggo-gg/core"
import { Vector3 } from "three"

const Guy = () => Character({
  id: "guy",
  components: {
    position: Position({ velocityResets: 0, gravity: 0.002, stop: 0.7, z: 1, x: 0, y: 2 }),
    networked: Networked(),
    collider: Collider({
      shape: "ball",
      radius: 4
    }),
    input: Input({
      release: {
        "escape": () => ({ actionId: "escape" }),
        "mb1": () => ({ actionId: "escape" }),
        "f": ({ hold }) => ({ actionId: "jump", params: { hold } }),
      },
      press: {
        "w,s": () => null, "a,d": () => null,
        "w,a": () => ({ actionId: "move", params: { key: "wa" } }),
        "w,d": () => ({ actionId: "move", params: { key: "wd" } }),
        "a,s": () => ({ actionId: "move", params: { key: "as" } }),
        "d,s": () => ({ actionId: "move", params: { key: "ds" } }),
        "w": () => ({ actionId: "move", params: { key: "w" } }),
        "a": () => ({ actionId: "move", params: { key: "a" } }),
        "s": () => ({ actionId: "move", params: { key: "s" } }),
        "d": () => ({ actionId: "move", params: { key: "d" } }),
        " ": () => ({ actionId: "move", params: { key: "up" } })
      }
    }),
    actions: Actions({
      escape: Action("escape", ({ world }) => {
        world.three?.pointerLock()
      }),
      jump: Action("jump", ({ entity, params }) => {
        const position = entity?.components?.position
        if (!position || !params.hold) return

        if (!position.data.standing) return

        position.setVelocity({ z: min(params.hold, 50) * 0.005 })
      }),
      move: Action("move", ({ entity, params, world }) => {
        const camera = world.three?.camera
        if (!camera) return

        const { position } = entity?.components ?? {}
        if (!position) return

        if (!["wa", "wd", "as", "ds", "a", "d", "w", "s", "up"].includes(params.key)) return

        const dir = camera.worldDirection(world)
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
        } else if (params.key === "wa") {
          const forward = dir.clone().normalize()
          const left = new Vector3().crossVectors(camera.c.up, dir).normalize()
          toward.copy(forward.add(left).normalize())
        } else if (params.key === "wd") {
          const forward = dir.clone().normalize()
          const right = new Vector3().crossVectors(dir, camera.c.up).normalize()
          toward.copy(forward.add(right).normalize())
        } else if (params.key === "as") {
          const backward = dir.clone().negate().normalize()
          const left = new Vector3().crossVectors(camera.c.up, dir).normalize()
          toward.copy(backward.add(left).normalize())
        } else if (params.key === "ds") {
          const backward = dir.clone().negate().normalize()
          const right = new Vector3().crossVectors(dir, camera.c.up).normalize()
          toward.copy(backward.add(right).normalize())
        } else if (params.key === "up") {
          if (!position.data.standing) return
          toward.set(0, 0.04, 0)
          setZ = true
        }

        if (!setZ) {
          // if (toward.x !== 0)
          position.impulse({ x: toward.x * 0.2, y: toward.z * 0.2 })
        }
        // if (!setZ) position.setVelocity({ x: toward.x * 2, y: toward.z * 2 })
        if (setZ) position.setVelocity({ z: toward.y })
      })
    }),
    team: Team(1)
  }
})

export const Experiment: GameBuilder = {
  id: "3D",
  init: (world) => {

    world.renderer?.deactivate(world)
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
