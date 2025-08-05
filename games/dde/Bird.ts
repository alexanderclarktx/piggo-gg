import {
  Action, Actions, Character, Collider, Input, localAim, Networked,
  Player, Point, Position, round, Team, World, XYZ
} from "@piggo-gg/core"
import { Vector3 } from "three"
import { DDEState } from "./DDE"

const upAndDir = (world: World): { vec: XYZ, dir: XYZ } => {
  const camera = world.three?.camera
  if (!camera) return { vec: { x: 0, y: 0, z: 0 }, dir: { x: 0, y: 0, z: 0 } }

  const vec = { x: round(camera.c.up.x, 3), y: round(camera.c.up.y, 3), z: round(camera.c.up.z, 3) }
  const cameraWorldDirection = camera.worldDirection()
  const dir = {
    x: round(cameraWorldDirection.x, 3),
    y: round(cameraWorldDirection.y, 3),
    z: round(cameraWorldDirection.z, 3)
  }
  return { vec, dir }
}

export const Bird = (player: Player) => Character({
  id: `bird-${player.id}`,
  components: {
    position: Position({ friction: true, gravity: 0.002, flying: false, z: 6, x: 20, y: 20 }),
    networked: Networked(),
    collider: Collider({
      shape: "ball",
      radius: 0.1
    }),
    input: Input({
      joystick: ({ world }) => {
        if (!world.client?.mobile) return null
        const { power, angle, active } = world.client.analog.left
        if (!active) return null

        let dir = { x: Math.cos(angle), y: Math.sin(angle) }

        dir = {
          x: dir.x * Math.cos(-localAim.x) - dir.y * Math.sin(-localAim.x),
          y: dir.x * Math.sin(-localAim.x) + dir.y * Math.cos(-localAim.x)
        }

        return { actionId: "move2", params: { dir, power } }
      },
      release: {
        "escape": ({ world }) => {
          world.three?.pointerLock()
          return null
        },
        "mb1": ({ world, target }) => {
          if (target !== "canvas") return null
          if (world.client?.mobile) return null
          world.three?.pointerLock()
          return null
        },
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
        "shift,w,a": ({ world }) => ({ actionId: "move", params: { key: "wa", sprint: true, ...upAndDir(world) } }),
        "shift,w,d": ({ world }) => ({ actionId: "move", params: { key: "wd", sprint: true, ...upAndDir(world) } }),
        "shift,a,s": ({ world }) => ({ actionId: "move", params: { key: "as", sprint: true, ...upAndDir(world) } }),
        "shift,d,s": ({ world }) => ({ actionId: "move", params: { key: "ds", sprint: true, ...upAndDir(world) } }),
        "shift,w": ({ world }) => ({ actionId: "move", params: { key: "w", sprint: true, ...upAndDir(world) } }),
        "shift,a": ({ world }) => ({ actionId: "move", params: { key: "a", sprint: true, ...upAndDir(world) } }),
        "shift,s": ({ world }) => ({ actionId: "move", params: { key: "s", sprint: true, ...upAndDir(world) } }),
        "shift,d": ({ world }) => ({ actionId: "move", params: { key: "d", sprint: true, ...upAndDir(world) } }),

        // move
        "w,a": ({ world }) => ({ actionId: "move", params: { key: "wa", ...upAndDir(world) } }),
        "w,d": ({ world }) => ({ actionId: "move", params: { key: "wd", ...upAndDir(world) } }),
        "a,s": ({ world }) => ({ actionId: "move", params: { key: "as", ...upAndDir(world) } }),
        "d,s": ({ world }) => ({ actionId: "move", params: { key: "ds", ...upAndDir(world) } }),
        "w": ({ world }) => ({ actionId: "move", params: { key: "w", ...upAndDir(world) } }),
        "a": ({ world }) => ({ actionId: "move", params: { key: "a", ...upAndDir(world) } }),
        "s": ({ world }) => ({ actionId: "move", params: { key: "s", ...upAndDir(world) } }),
        "d": ({ world }) => ({ actionId: "move", params: { key: "d", ...upAndDir(world) } })
      }
    }),
    actions: Actions({
      point: Point,
      transform: Action("transform", ({ entity, world, player }) => {
        const { position } = entity?.components ?? {}
        if (!position) return

        position.data.flying = !position.data.flying

        if (player) {
          const state = world.game.state as DDEState
          if (state.applesEaten[player.id] !== undefined) {
            state.applesEaten[player.id] = 0
            delete state.applesTimer[player.id]
          }
        }
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
        world.client?.soundManager.play({ soundName: "bubble", threshold: { pos: position.data, distance: 5 } })
      }),
      move2: Action("move2", ({ entity, params }) => {
        if (!params.dir.x || !params.dir.y || !params.power) return

        const { position } = entity?.components ?? {}
        if (!position) return

        let factor = 0

        if (position.data.flying) {
          factor = params.sprint ? 0.16 : 0.09
        } else if (position.data.standing) {
          factor = params.sprint ? 0.65 : 0.45
        } else {
          factor = params.sprint ? 0.09 : 0.056
        }

        position.impulse({ x: params.dir.x * params.power * factor, y: params.dir.y * params.power * factor })
      }),
      move: Action("move", ({ entity, params }) => {
        if (!params.vec || !params.dir) return

        const up = new Vector3(params.vec.x, params.vec.y, params.vec.z)
        const dir = new Vector3(params.dir.x, params.dir.y, params.dir.z)

        const { position } = entity?.components ?? {}
        if (!position) return

        if (!["wa", "wd", "as", "ds", "a", "d", "w", "s", "up"].includes(params.key)) return

        const toward = new Vector3()

        let rotating = 0

        if (params.key === "a") {
          toward.crossVectors(up, dir).normalize()

          rotating = 0.1
        } else if (params.key === "d") {
          toward.crossVectors(dir, up).normalize()

          rotating = -0.1
        } else if (params.key === "w") {
          toward.copy(dir).normalize()
        } else if (params.key === "s") {
          toward.copy(dir).negate().normalize()
        } else if (params.key === "wa") {
          const forward = dir.clone().normalize()
          const left = new Vector3().crossVectors(up, dir).normalize()
          toward.copy(forward.add(left).normalize())

          rotating = 0.1
        } else if (params.key === "wd") {
          const forward = dir.clone().normalize()
          const right = new Vector3().crossVectors(dir, up).normalize()
          toward.copy(forward.add(right).normalize())

          rotating = -0.1
        } else if (params.key === "as") {
          const backward = dir.clone().negate().normalize()
          const left = new Vector3().crossVectors(up, dir).normalize()
          toward.copy(backward.add(left).normalize())

          rotating = 0.1
        } else if (params.key === "ds") {
          const backward = dir.clone().negate().normalize()
          const right = new Vector3().crossVectors(dir, up).normalize()
          toward.copy(backward.add(right).normalize())

          rotating = -0.1
        }

        if (rotating) position.data.rotating = rotating

        let factor = 0

        if (position.data.flying) {
          factor = params.sprint ? 0.16 : 0.09
        } else if (position.data.standing) {
          factor = params.sprint ? 0.65 : 0.45
        } else {
          factor = params.sprint ? 0.09 : 0.056
        }

        position.impulse({ x: toward.x * factor, y: toward.z * factor })
      })
    }),
    team: Team(1)
  }
})
