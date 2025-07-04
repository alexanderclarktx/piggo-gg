import { Action, Actions, Character, Collider, Input, min, Networked, Position, Team } from "@piggo-gg/core"
import { Vector3 } from "three"

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
        "f": ({ hold }) => ({ actionId: "jump", params: { hold } }),
        "g": ({ world }) => {
          world.three?.setDebug()
          return null
        },
        "e": () => ({ actionId: "fly" })
      },
      press: {
        "w,s": () => null, "a,d": () => null,

        "shift,w,a": () => ({ actionId: "move", params: { key: "wa", sprint: true } }),
        "shift,w,d": () => ({ actionId: "move", params: { key: "wd", sprint: true } }),
        "shift,a,s": () => ({ actionId: "move", params: { key: "as", sprint: true } }),
        "shift,d,s": () => ({ actionId: "move", params: { key: "ds", sprint: true } }),
        "shift,w": () => ({ actionId: "move", params: { key: "w", sprint: true } }),
        "shift,a": () => ({ actionId: "move", params: { key: "a", sprint: true } }),
        "shift,s": () => ({ actionId: "move", params: { key: "s", sprint: true } }),
        "shift,d": () => ({ actionId: "move", params: { key: "d", sprint: true } }),

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
      fly: Action("fly", ({ entity }) => {
        const { position } = entity?.components ?? {}
        if (!position) return

        position.data.flying = !position.data.flying
        position.data.velocity.z = 0
      }),
      jump: Action("jump", ({ entity, params }) => {
        const position = entity?.components?.position
        if (!position || !params.hold) return

        if (!position.data.standing || position.data.flying) return

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

          if (position.data.flying) {
            world.three?.eagle?.scene.rotateZ(0.1)
          }
        } else if (params.key === "d") {
          toward.crossVectors(dir, camera.c.up).normalize()

          if (position.data.flying) {
            world.three?.eagle?.scene.rotateZ(-0.1)
          }
        } else if (params.key === "w") {
          toward.copy(dir).normalize()
        } else if (params.key === "s") {
          if (position.data.flying) return

          toward.copy(dir).negate().normalize()
        } else if (params.key === "wa") {
          const forward = dir.clone().normalize()
          const left = new Vector3().crossVectors(camera.c.up, dir).normalize()
          toward.copy(forward.add(left).normalize())

          if (position.data.flying) {
            world.three?.eagle?.scene.rotateZ(0.1)
          }
        } else if (params.key === "wd") {
          const forward = dir.clone().normalize()
          const right = new Vector3().crossVectors(dir, camera.c.up).normalize()
          toward.copy(forward.add(right).normalize())

          if (position.data.flying) {
            world.three?.eagle?.scene.rotateZ(-0.1)
          }
        } else if (params.key === "as") {
          if (position.data.flying) return

          const backward = dir.clone().negate().normalize()
          const left = new Vector3().crossVectors(camera.c.up, dir).normalize()
          toward.copy(backward.add(left).normalize())
        } else if (params.key === "ds") {
          if (position.data.flying) return

          const backward = dir.clone().negate().normalize()
          const right = new Vector3().crossVectors(dir, camera.c.up).normalize()
          toward.copy(backward.add(right).normalize())
        } else if (params.key === "up") {
          if (!position.data.standing || position.data.flying) return
          toward.set(0, 0.04, 0)
          setZ = true

          world.client?.soundManager.play("bubble")
        }

        if (!setZ) {
          let factor = 0
          if (params.sprint) {
            factor = position.data.standing ? 0.9 : 0.12
          } else {
            factor = position.data.standing ? 0.5 : 0.08
          }
          position.impulse({ x: toward.x * factor, y: toward.z * factor })
        }
        if (setZ) position.setVelocity({ z: toward.y })
      })
    }),
    team: Team(1)
  }
})
