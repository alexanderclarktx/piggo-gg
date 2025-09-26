import {
  abs, Action, Actions, Character, Collider, cos, HookItem,
  hypot, Input, Inventory, LaserItem, max, Networked, PI,
  Place, Player, Point, Position, Ready, round, setActiveItemIndex,
  sin, sqrt, Team, Three, World, XYZ, XZ
} from "@piggo-gg/core"
import { AnimationAction, AnimationMixer, Mesh, MeshStandardMaterial, Object3D, Vector3 } from "three"
import { CraftSettings, CraftState } from "./Craft"

const upAndDir = (world: World): { up: XYZ, dir: XZ } => {
  const camera = world.three?.camera
  if (!camera) return { up: { x: 0, y: 0, z: 0 }, dir: { x: 0, z: 0 } }

  const up = { x: round(camera.c.up.x, 3), y: round(camera.c.up.y, 3), z: round(camera.c.up.z, 3) }
  const dir = XZ(camera.dir(world))
  return { up, dir }
}

const walk = 0.78
const run = 1.2
const hop = 0.18
const leap = 0.3

export const Bird = (player: Player): Character => {

  let duck: Object3D = new Object3D()
  let eagle: Object3D = new Object3D()
  let pig: Object3D = new Object3D()

  let pigMixer: AnimationMixer | undefined
  let eagleMixer: AnimationMixer | undefined

  let idleAnimation: AnimationAction | undefined
  let runAnimation: AnimationAction | undefined
  let animation: "idle" | "run" = "idle"

  const bird = Character({
    id: `bird-${player.id}`,
    components: {
      position: Position({ friction: true, gravity: 0.0024, flying: false, z: 6, x: 25, y: 18 }),
      networked: Networked(),
      inventory: Inventory([LaserItem, HookItem]),
      collider: Collider({
        shape: "ball",
        radius: 0.1
      }),
      three: Three({
        onRender: ({ entity, world, delta, client, three }) => {
          const ratio = delta / 25

          const { position } = entity.components
          const { aim, rotation, rotating, velocity, flying } = position.data

          const interpolated = position.interpolate(world, delta)
          if (player.id === client.playerId()) {
            // three.sphere?.position.set(interpolated.x, interpolated.z + 0.05, interpolated.y)
          }

          const orientation = player.id === client.playerId() ? client.controls.localAim : aim

          if (flying) {
            pig.visible = false
            eagle.visible = true

            // position
            eagle.position.set(interpolated.x, interpolated.z + 0.06, interpolated.y)

            // rotation
            eagle.rotation.y = orientation.x
            eagle.rotation.x = orientation.y
            eagle.rotation.z = rotation - rotating * (40 - delta) / 40

            // animation
            const speed = sqrt(hypot(velocity.x, velocity.y, velocity.z))
            eagleMixer?.update(speed * ratio * 0.01 + 0.01)
          } else {
            pig.visible = true
            eagle.visible = false

            // position
            pig.position.set(interpolated.x, interpolated.z + 0, interpolated.y)

            // rotation
            pig.rotation.y = orientation.x + PI

            // animation
            const speed = hypot(position.data.velocity.x, position.data.velocity.y)

            if (runAnimation && idleAnimation && pigMixer) {
              if (speed === 0 && animation === "run") {
                animation = "idle"
                runAnimation.crossFadeTo(idleAnimation.reset().play(), 0.2, false)
              } else if (speed > 0 && animation === "idle") {
                animation = "run"
                idleAnimation?.crossFadeTo(runAnimation.reset().play(), 0.2, false)
              }

              pigMixer?.update(speed * ratio * 0.005 + 0.005)
            } else {
              pigMixer?.update(speed * ratio * 0.005 + 0.005)
            }
          }

          if ((three.camera.transition < 125) && player.id === client.playerId()) {

            const opacity = three.camera.mode === "first" ? 1 - (three.camera.transition / 100) : three.camera.transition / 100

            pig.traverse((child) => {
              if (child instanceof Mesh) {
                child.material.opacity = opacity
              }
            })

            eagle.traverse((child) => {
              if (child instanceof Mesh) {
                child.material.opacity = opacity
              }
            })
          }
        },
        init: async (entity, _, three) => {
          three.gLoader.load("cowboy.glb", (gltf) => {
            pig = gltf.scene
            pig.animations = gltf.animations
            pig.frustumCulled = false
            pig.scale.set(0.16, 0.18, 0.16)

            pigMixer = new AnimationMixer(pig)

            idleAnimation = pigMixer.clipAction(pig.animations[2])
            runAnimation = pigMixer.clipAction(pig.animations[8])

            idleAnimation?.play()

            pig.traverse((child) => {
              if (child instanceof Mesh) {
                child.material.transparent = true
                child.material.opacity = 0

                child.castShadow = true
                child.receiveShadow = true
              }
            })

            entity.components.three.o.push(pig)
          })

          three.gLoader.load("eagle.glb", (gltf) => {
            eagle = gltf.scene
            eagle.animations = gltf.animations
            eagle.scale.set(0.05, 0.05, 0.05)
            eagle.frustumCulled = false

            eagle.rotation.order = "YXZ"

            eagleMixer = new AnimationMixer(eagle)
            eagleMixer.clipAction(eagle.animations[0]).play()

            const colors: Record<string, number> = {
              Cylinder: 0x5C2421,
              Cylinder_1: 0xE7C41C,
              Cylinder_2: 0xffffff,
              Cylinder_3: 0x632724
            }

            eagle.traverse((child) => {
              if (child instanceof Mesh) {
                child.material = new MeshStandardMaterial({ color: colors[child.name], transparent: true, opacity: 1 })
                child.castShadow = true
                child.receiveShadow = true
              }
            })

            entity.components.three.o.push(eagle)
          })
        }
      }),
      input: Input({
        joystick: ({ client }) => {
          const { localAim } = client.controls
          const { power, angle } = client.controls.left

          const x = cos(angle)
          const y = sin(angle)

          const dir = {
            x: x * cos(-localAim.x) - y * sin(-localAim.x),
            y: x * sin(-localAim.x) + y * cos(-localAim.x)
          }

          return { actionId: "moveAnalog", params: { dir, power, angle } }
        },
        release: {
          "escape": ({ world, client }) => {
            if (!client.mobile) world.three?.pointerLock()
            return null
          },
          "mb1": ({ world, target, client }) => {
            if (target !== "canvas") return null

            if (client.mobile && client.mobileLock) {
              client.mobileLock = false
              return null
            }

            if (client.mobile) return null

            world.three?.pointerLock()
            return null
          }
        },
        press: {
          "1": () => ({ actionId: "setActiveItemIndex", params: { index: 0 } }),
          "2": () => ({ actionId: "setActiveItemIndex", params: { index: 1 } }),
          "3": () => ({ actionId: "setActiveItemIndex", params: { index: 2 } }),
          "4": () => ({ actionId: "setActiveItemIndex", params: { index: 3 } }),
          "5": () => ({ actionId: "setActiveItemIndex", params: { index: 4 } }),
          "6": () => ({ actionId: "setActiveItemIndex", params: { index: 5 } }),
          "7": () => ({ actionId: "setActiveItemIndex", params: { index: 6 } }),

          "scrolldown": ({ client }) => {
            const bufferScroll = client.bufferScroll
            if (bufferScroll < 20) return null

            client.bufferScroll = 0
            return { actionId: "setActiveItemIndex", params: { index: "down" } }
          },

          "scrollup": ({ client }) => {
            const bufferScroll = client.bufferScroll
            if (bufferScroll > -20) return null
            client.bufferScroll = 0
            return { actionId: "setActiveItemIndex", params: { index: "up" } }
          },

          "r": ({ hold }) => {
            if (hold) return null
            return { actionId: "ready" }
          },

          "q": ({ world, hold }) => {
            if (hold) return null
            const { camera } = world.three!
            camera.mode = camera.mode === "first" ? "third" : "first"
            return null
          },

          "n": ({ world, hold }) => {
            if (hold) return null

            const settings = world.settings<CraftSettings>()
            settings.showNametags = !settings.showNametags

            return null
          },

          "mb2": ({ hold, world, character }) => {
            if (hold) return null
            if (!character) return null

            const dir = world.three!.camera.dir(world)
            const camera = world.three!.camera.pos()
            const pos = character.components.position.xyz()

            return { actionId: "place", params: { dir, camera, pos } }
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

          const state = world.game.state as CraftState
          if (state.phase === "play") return
          if (state.hit[entity?.id ?? ""]) return

          position.data.flying = !position.data.flying
        }),
        place: Place,
        setActiveItemIndex,
        jump: Action("jump", ({ entity, world, params }) => {
          if (!entity) return

          const { position } = entity?.components ?? {}
          if (!position) return

          if (position.data.flying) return
          if (!position.data.standing && params.hold) return

          const state = world.game.state as CraftState
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
        moveAnalog: Action("moveAnalog", ({ entity, params }) => {
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
        move: Action<{ up: XYZ, dir: XZ, key: string, sprint: boolean }>("move", ({ entity, params, world }) => {
          if (!params.up || !params.dir) return

          const state = world.state<CraftState>()
          if (state.hit[entity?.id ?? ""]) return

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
    }
  })
  return bird
}
