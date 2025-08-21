import {
  abs, Action, Actions, Character, Collider, cos, Input, Laser, max,
  Networked, Player, Point, Position, Ready, round, Target, Team, World, XYZ
} from "@piggo-gg/core"
import { Vector3 } from "three"
import { DDEState } from "./DDE"

const upAndDir = (world: World): { vec: XYZ, dir: XYZ } => {
  const camera = world.three?.camera
  if (!camera) return { vec: { x: 0, y: 0, z: 0 }, dir: { x: 0, y: 0, z: 0 } }

  const vec = { x: round(camera.c.up.x, 3), y: round(camera.c.up.y, 3), z: round(camera.c.up.z, 3) }
  const cameraWorldDirection = camera.worldDirection(world)
  const dir = {
    x: round(cameraWorldDirection.x, 3),
    y: round(cameraWorldDirection.y, 3),
    z: round(cameraWorldDirection.z, 3)
  }
  return { vec, dir }
}

const walk = 0.6
const run = 0.95
const hop = 0.15
const leap = 0.23

export const Bird = (player: Player) => Character({
  id: `bird-${player.id}`,
  components: {
    position: Position({ friction: true, gravity: 0.0024, flying: false, z: 6, x: 25, y: 18 }),
    networked: Networked(),
    collider: Collider({
      shape: "ball",
      radius: 0.1
    }),
    input: Input({
      joystick: ({ world }) => {
        if (!world.client) return null

        const { localAim } = world.client.controls
        const { power, angle } = world.client.controls.left

        let dir = { x: Math.cos(angle), y: Math.sin(angle) }

        dir = {
          x: dir.x * Math.cos(-localAim.x) - dir.y * Math.sin(-localAim.x),
          y: dir.x * Math.sin(-localAim.x) + dir.y * Math.cos(-localAim.x)
        }

        return { actionId: "moveAnalog", params: { dir, power, angle } }
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
        }
      },
      press: {
        "r": ({ hold }) => {
          if (hold) return null
          return { actionId: "ready" }
        },

        "mb1": ({ hold, character, world }) => {
          if (hold || !document.pointerLockElement || !character) return null

          const { position } = character?.components
          const pos = { x: position.data.x, y: position.data.y, z: position.data.z }
          const aim = { ...world.client!.controls.localAim }

          const targets: Target[] = world.characters().filter(c => c.id !== character.id).map(x => ({
            x: x.components.position.data.x,
            y: x.components.position.data.y,
            z: x.components.position.data.z,
            id: x.id
          }))

          return { actionId: "laser", params: { pos, aim, targets } }
        },

        // transform
        "e": ({ hold }) => {
          if (hold) return null
          return { actionId: "transform" }
        },

        // debug
        "g": ({ world, hold }) => {
          if (hold === 40) {
            world.debug = !world.debug
            world.three?.setDebug()
          }
          return null
        },

        // jump
        " ": ({ hold }) => ({ actionId: "jump", params: { hold } }),

        // no movement
        "w,s": () => null, "a,d": () => null,

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
      ready: Ready,
      point: Point,
      transform: Action("transform", ({ entity, world }) => {
        const { position } = entity?.components ?? {}
        if (!position) return

        const state = world.game.state as DDEState
        if (state.phase === "play") return
        if (state.hit[entity?.id ?? ""]) return

        position.data.flying = !position.data.flying
      }),
      laser: Laser,
      jump: Action("jump", ({ entity, world, params }) => {
        if (!entity) return

        const { position } = entity?.components ?? {}
        if (!position) return

        if (position.data.flying) return
        if (!position.data.standing && params.hold) return

        const state = world.game.state as DDEState
        if (state.hit[entity.id]) return
        if (!position.data.standing && state.doubleJumped.includes(entity.id)) return

        // double jumped
        if (!position.data.standing) {
          position.setVelocity({ z: max(0.05, 0.025 + position.data.velocity.z) })
          state.doubleJumped.push(entity.id)
        } else {
          position.setVelocity({ z: 0.05 })
        }

        world.client?.sound.play({ name: "bubble", threshold: { pos: position.data, distance: 5 } })
      }),
      moveAnalog: Action("moveAnalog", ({ entity, params, world }) => {
        if (!params.dir.x || !params.dir.y || !params.power) return

        const { position } = entity?.components ?? {}
        if (!position) return

        let factor = 0

        if (position.data.flying) {
          factor = params.sprint ? 0.16 : 0.09

          const sideness = cos(params.angle)
          if (abs(sideness) > 0.5) position.data.rotating = -sideness * 0.1
        } else if (position.data.standing) {
          factor = params.sprint ? run : walk
        } else {
          factor = params.sprint ? leap : hop
        }

        position.impulse({ x: params.dir.x * params.power * factor, y: params.dir.y * params.power * factor })
      }),
      move: Action("move", ({ entity, params, world }) => {
        if (!params.vec || !params.dir) return

        const state = world.state<DDEState>()
        if (state.hit[entity?.id ?? ""]) return

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
          factor = params.sprint ? run : walk
        } else {
          factor = params.sprint ? leap : hop
        }

        if (position.data.standing) {
          // world.client?.sound.play({ name: "steps", threshold: { pos: position.data, distance: 5 } })
        }

        position.impulse({ x: toward.x * factor, y: toward.z * factor })
      })
    }),
    team: Team(1)
  }
})
