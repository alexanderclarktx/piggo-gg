import { Action, Actions, Character, Collider, Input, max, Networked, Position, Team } from "@piggo-gg/core"
import { Vector3 } from "three"
import { DDEState } from "./DDE"

export const Bird = () => Character({
  id: "bird",
  components: {
    position: Position({ friction: true, gravity: 0.002, flying: true, z: 6, x: 20, y: 20 }),
    networked: Networked(),
    collider: Collider({
      shape: "ball",
      radius: 0.1
    }),
    input: Input({
      release: {
        "escape": () => ({ actionId: "escape" }),
        "mb1": () => ({ actionId: "escape" }),
        "e": () => ({ actionId: "transform" })
      },
      press: {
        "w,s": () => null, "a,d": () => null,

        // debug
        "g": ({ world, hold }) => {
          if (hold === 40) world.three?.setDebug()
          return null
        },

        // jump
        " ": ({ hold }) => ({ actionId: "jump", params: { hold } }),

        // sprint
        "shift,w,a": () => ({ actionId: "move", params: { key: "wa", sprint: true } }),
        "shift,w,d": () => ({ actionId: "move", params: { key: "wd", sprint: true } }),
        "shift,a,s": () => ({ actionId: "move", params: { key: "as", sprint: true } }),
        "shift,d,s": () => ({ actionId: "move", params: { key: "ds", sprint: true } }),
        "shift,w": () => ({ actionId: "move", params: { key: "w", sprint: true } }),
        "shift,a": () => ({ actionId: "move", params: { key: "a", sprint: true } }),
        "shift,s": () => ({ actionId: "move", params: { key: "s", sprint: true } }),
        "shift,d": () => ({ actionId: "move", params: { key: "d", sprint: true } }),

        // move
        "w,a": () => ({ actionId: "move", params: { key: "wa" } }),
        "w,d": () => ({ actionId: "move", params: { key: "wd" } }),
        "a,s": () => ({ actionId: "move", params: { key: "as" } }),
        "d,s": () => ({ actionId: "move", params: { key: "ds" } }),
        "w": () => ({ actionId: "move", params: { key: "w" } }),
        "a": () => ({ actionId: "move", params: { key: "a" } }),
        "s": () => ({ actionId: "move", params: { key: "s" } }),
        "d": () => ({ actionId: "move", params: { key: "d" } })
      }
    }),
    actions: Actions({
      escape: Action("escape", ({ world }) => {
        world.three?.pointerLock()
      }),
      transform: Action("transform", ({ entity }) => {
        const { position } = entity?.components ?? {}
        if (!position) return

        position.data.flying = !position.data.flying
        position.data.velocity.z = max(0, position.data.velocity.z)
      }),
      jump: Action("jump", ({ entity, world, params }) => {
        if (!entity) return

        const { position } = entity?.components ?? {}
        if (!position) return

        if (position.data.flying) return
        if (!position.data.standing && params.hold) return

        const state = world.game.state as DDEState
        if (!position.data.standing && state.doubleJumped.includes(entity.id)) return

        // double jumped
        if (!position.data.standing) state.doubleJumped.push(entity.id)

        position.setVelocity({ z: 0.04 })
        world.client?.soundManager.play("bubble")
      }),
      move: Action("move", ({ entity, params, world }) => {
        const camera = world.three?.camera
        if (!camera) return

        const { position } = entity?.components ?? {}
        if (!position) return

        if (!["wa", "wd", "as", "ds", "a", "d", "w", "s", "up"].includes(params.key)) return

        const dir = camera.worldDirection(world)
        const toward = new Vector3()

        let rotating = 0

        if (params.key === "a") {
          toward.crossVectors(camera.c.up, dir).normalize()

          rotating = 0.1
        } else if (params.key === "d") {
          toward.crossVectors(dir, camera.c.up).normalize()

          rotating = -0.1
        } else if (params.key === "w") {
          toward.copy(dir).normalize()
        } else if (params.key === "s") {
          if (!position.data.flying) {
            toward.copy(dir).negate().normalize()
          }
        } else if (params.key === "wa") {
          const forward = dir.clone().normalize()
          const left = new Vector3().crossVectors(camera.c.up, dir).normalize()
          toward.copy(forward.add(left).normalize())

          rotating = 0.1
        } else if (params.key === "wd") {
          const forward = dir.clone().normalize()
          const right = new Vector3().crossVectors(dir, camera.c.up).normalize()
          toward.copy(forward.add(right).normalize())

          rotating = -0.1
        } else if (params.key === "as") {
          if (!position.data.flying) {

            const backward = dir.clone().negate().normalize()
            const left = new Vector3().crossVectors(camera.c.up, dir).normalize()
            toward.copy(backward.add(left).normalize())
          }
        } else if (params.key === "ds") {
          if (!position.data.flying) {

            const backward = dir.clone().negate().normalize()
            const right = new Vector3().crossVectors(dir, camera.c.up).normalize()
            toward.copy(backward.add(right).normalize())
          }
        }

        if (rotating) position.data.rotating = rotating

        let factor = 0

        if (position.data.flying) {
          factor = params.sprint ? 0.16 : 0.09
        } else if (position.data.standing) {
          factor = params.sprint ? 0.8 : 0.5
        } else {
          factor = params.sprint ? 0.1 : 0.07
        }

        position.impulse({ x: toward.x * factor, y: toward.z * factor })
      })
    }),
    team: Team(1)
  }
})
