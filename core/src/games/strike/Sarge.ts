import {
  Action, Actions, Character, Collider, Input,
  Inventory, LaserItem, max, Networked, Player,
  Point, Position, Team, upAndDir, XYZ, XZ
} from "@piggo-gg/core"
import { Vector3 } from "three"
import { StrikeSettings, StrikeState } from "./Strike"

const walk = 0.78
const run = 1.2
const hop = 0.18
const leap = 0.3

export const Sarge = (player: Player): Character => {

  const sarge = Character({
    id: `sarge-${player.id}`,
    components: {
      position: Position({ friction: true, gravity: 0.0024 }),
      networked: Networked(),
      inventory: Inventory([LaserItem]),
      collider: Collider({ shape: "ball", radius: 0.1 }),
      input: Input({
        release: {
          "escape": ({ world, client }) => {
            if (!client.mobile) world.client?.pointerLock()
          },
          "mb1": ({ world, target, client }) => {
            if (target !== "canvas") return

            if (client.mobile && client.mobileMenu) {
              client.mobileMenu = false
              return
            }

            if (client.mobile) return

            world.client?.pointerLock()
            return
          }
        },
        press: {
          "q": ({ world, hold }) => {
            if (hold) return
            const { camera } = world.three!
            camera.mode = camera.mode === "first" ? "third" : "first"
            return
          },

          "n": ({ world, hold }) => {
            if (hold) return

            const settings = world.settings<StrikeSettings>()
            settings.showNametags = !settings.showNametags

            return
          },

          // debug
          "g": ({ world, hold }) => {
            if (hold === 40) {
              world.debug = !world.debug
            }
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
        point: Point,
        jump: Action("jump", ({ entity, world, params }) => {
          if (!entity) return

          const { position } = entity?.components ?? {}
          if (!position) return

          if (position.data.flying) return
          if (!position.data.standing && params.hold) return

          const state = world.game.state as StrikeState
          // if (state.hit[entity.id]) return
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
        move: Action<{ up: XYZ, dir: XZ, key: string, sprint: boolean }>("move", ({ entity, params, world }) => {
          if (!params.up || !params.dir) return

          const state = world.state<StrikeState>()
          // if (state.hit[entity?.id ?? ""]) return

          const up = new Vector3(params.up.x, params.up.y, params.up.z)
          const dir = new Vector3(params.dir.x, 0, params.dir.z)

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
      // three: Three({

      // }),
    }
  })

  return sarge
}