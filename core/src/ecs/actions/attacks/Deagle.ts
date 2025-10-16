import {
  Action, Actions, blockInLine, Character, cos, Effects, Entity, Gun, hypot, Input, Item,
  ItemComponents, max, min, Networked, NPC, PI, Player, playerForCharacter, Position,
  randomInt, randomLR, randomVector3, rayCapsuleIntersect, sin, Target, Three, XY, XYZ
} from "@piggo-gg/core"
import { Color, CylinderGeometry, Mesh, MeshPhongMaterial, Object3D, SphereGeometry, Vector3 } from "three"

const modelOffset = (localAim: XY, tip = false, recoil = 0): XYZ => {
  const dir = { x: sin(localAim.x), y: cos(localAim.x), z: sin(localAim.y) }
  const right = { x: cos(localAim.x), y: -sin(localAim.x) }

  const offset = {
    x: -dir.x * 0.05 + right.x * 0.05,
    y: recoil * 0.03,
    z: -dir.y * 0.05 + right.y * 0.05
  }

  if (tip) {
    offset.x -= dir.x * 0.1
    offset.y -= 0.035 - localAim.y * 0.1,
      offset.z -= dir.y * 0.1
  }

  return offset
}

export const DeagleItem = ({ character }: { character: Character }) => {

  let mesh: Object3D | undefined = undefined
  let tracer: Object3D | undefined = undefined
  let tracerState = { tick: 0, velocity: { x: 0, y: 0, z: 0 }, pos: { x: 0, y: 0, z: 0 } }

  const particles: { mesh: Mesh, velocity: XYZ, start: XYZ, duration: number, tick: number }[] = []
  const decalColor = new Color("#333333")

  let cd = -100

  const mvtError = 0.03
  const jmpError = 0.12

  const recoilRate = 0.04

  const spawnParticles = (pos: XYZ, tick: number) => {
    const proto = particles[0]
    if (!proto) return

    // decal particle
    const mesh = proto.mesh.clone()
    mesh.material = new MeshPhongMaterial({ color: decalColor, emissive: decalColor })
    mesh.position.set(pos.x, pos.z, pos.y)

    particles.push({ mesh, tick, velocity: { x: 0, y: 0, z: 0 }, start: { ...pos }, duration: 240 })

    // explosion particles
    for (let i = 0; i < 20; i++) {
      const mesh = proto.mesh.clone()
      mesh.position.set(pos.x, pos.z, pos.y)

      // vary the color
      const color = new Color(`rgb(255, ${randomInt(256)}, 0)`)
      mesh.material = new MeshPhongMaterial({ color, emissive: color })

      particles.push({
        mesh, tick,
        velocity: randomVector3(0.03),
        start: { ...pos },
        duration: 6
      })
    }
  }

  const item = Entity<ItemComponents | Gun>({
    id: `deagle-${character.id}`,
    components: {
      position: Position(),
      effects: Effects(),
      networked: Networked(),
      item: Item({ name: "deagle", stackable: false }),
      gun: Gun({ name: "deagle", clipSize: 7, automatic: false, reloadTime: 60, damage: 35, fireRate: 5, ammo: 7, bulletSize: 0.02, speed: 3 }),
      input: Input({
        press: {

          "r": ({ hold, client }) => {
            if (hold) return

            const { gun } = item.components

            if (gun.data.ammo >= 7) return
            if (gun.data.reloading) return

            client.sound.play({ name: "reload" })

            return { actionId: "reload" }
          },

          "mb1": ({ hold, character, world, aim, client, delta }) => {
            if (hold) return
            if (!character) return
            if (!document.pointerLockElement && !client.mobile) return
            if (world.client?.mobileMenu) return

            if (item.components.gun!.data.ammo <= 0) {
              world.client?.sound.play({ name: "clink" })
              return
            }

            if (cd + 5 > world.tick) return
            cd = world.tick

            const { position } = character.components

            const targets: Target[] = world.characters()
              .filter(c => c.id !== character.id)
              .map(target => ({
                ...target.components.position.interpolate(world, delta ?? 0),
                id: target.id
              }))

            const velocity = hypot(position.data.velocity.x, position.data.velocity.y, position.data.velocity.z)
            const errorFactor = mvtError * velocity + (position.data.standing ? 0 : jmpError)
            const error = { x: randomLR(errorFactor), y: randomLR(errorFactor) }

            const params: DeagleParams = {
              aim, targets, error,
              pos: position.xyz(),
              rng: randomLR(0.1)
            }

            return { actionId: "deagle", params }
          },
        }
      }),
      npc: NPC({
        behavior: (_, world) => {
          const { recoil } = character.components.position.data

          // TODO move this to a system
          if (recoil > 0) {
            character.components.position.data.recoil = max(0, recoil - recoilRate)
          }

          const { gun } = item.components

          if (world.tick === gun.data.reloading) {
            gun.data.ammo = 7
            gun.data.reloading = undefined
          }
        }
      }),
      actions: Actions({
        reload: Action("reload", ({ world }) => {
          const { gun } = item.components
          if (!gun) return

          gun.data.reloading = world.tick + 40
        }),
        deagle: Action<DeagleParams>("deagle", ({ world, params, offline }) => {

          world.client?.sound.play({ name: "deagle", threshold: { pos: params.pos, distance: 5 } })

          const { pos, aim, targets, error } = params

          const eyePos = { x: pos.x, y: pos.y, z: pos.z + 0.5 }
          const eyes = new Vector3(eyePos.x, eyePos.z, eyePos.y)

          const { recoil } = character.components.position.data

          if (recoil) {
            aim.y += recoil * 0.1
            aim.x += recoil * params.rng * 0.5
          }

          if (error) {
            aim.x += error.x
            aim.y += error.y
          }

          item.components.gun!.data.ammo -= 1

          // apply recoil
          character.components.position.data.recoil = min(1.4, recoil + 0.5)

          const target = new Vector3(
            -sin(aim.x) * cos(aim.y), sin(aim.y), -cos(aim.x) * cos(aim.y)
          ).normalize().multiplyScalar(10).add(eyes)

          const dir = target.clone().sub(eyes).normalize()

          // update tracer
          if (world.client) {
            const { localAim } = world.client.controls
            const offset = modelOffset(localAim, true, recoil)

            // tracer
            if (tracer) {
              const tracerPos = { x: eyes.x + offset.x, y: eyes.y + offset.y, z: eyes.z + offset.z }
              tracer.position.copy(tracerPos)

              const tracerDir = target.clone().sub(tracerPos).normalize()

              tracer.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), tracerDir)

              tracerState.tick = world.tick
              tracerState.velocity = tracerDir.clone().multiplyScalar(1.5)
              tracerState.pos = tracerPos
            }
          }

          let hit: Player | undefined = undefined
          let headshot = false

          // raycast against characters
          for (const target of targets) { // TODO sort by distance
            if (offline) continue

            const targetEntity = world.entity<Position>(target.id)
            if (!targetEntity) continue

            if (!targetEntity.components.health) continue
            if (targetEntity.components.health.data.hp <= 0) continue

            // head
            let A = { x: target.x, y: target.y, z: target.z + 0.52 }
            let B = { x: target.x, y: target.y, z: target.z + 0.55 }
            let radius = 0.04

            if (rayCapsuleIntersect(eyePos, { x: dir.x, y: dir.z, z: dir.y }, A, B, radius)) {
              hit = playerForCharacter(world, target.id)
              headshot = true
              break
            }

            // body

            A = { x: target.x, y: target.y, z: target.z + 0.09 }
            B = { x: target.x, y: target.y, z: target.z + 0.43 }
            radius = 0.064

            if (rayCapsuleIntersect(eyePos, { x: dir.x, y: dir.z, z: dir.y }, A, B, radius)) {
              hit = playerForCharacter(world, target.id)
              break
            }
          }

          if (hit) {
            if (character.id === world.client?.character()?.id) {
              world.client.controls.localHit = { tick: world.tick, headshot }
            }

            const hitCharacter = hit.components.controlling.getCharacter(world)
            if (hitCharacter?.components.health) {
              const damage = headshot ? 100 : 35
              hitCharacter.components.health.damage(
                damage, world, playerForCharacter(world, character.id)?.id, headshot ? "headshot" : "body"
              )
            }

            return
          }

          // raycast against blocks
          const beamResult = blockInLine({ from: eyePos, dir, world, cap: 60, maxDist: 30 })
          if (beamResult) {
            if (beamResult.inside.type === 6) {
              world.blocks.remove(beamResult.inside)
            }
            // if (world.debug) {
            //   if (beamResult.inside.type === 12) {
            //     world.blocks.setType(beamResult.inside, 3)
            //     delete world.blocks.coloring[`${beamResult.inside.x},${beamResult.inside.y},${beamResult.inside.z}`]
            //   } else {
            //     world.blocks.remove(beamResult.inside)
            //   }
            // } else if (beamResult.inside.type !== 12) {
            //   world.blocks.setType(beamResult.inside, 12)
            // } else {
            //   world.blocks.setType(beamResult.inside, 12)
            //   const xyzstr: XYZstring = `${beamResult.inside.x},${beamResult.inside.y},${beamResult.inside.z}`
            //   if (world.blocks.coloring[xyzstr]) {
            //     const color = nextColor(world.blocks.coloring[xyzstr] as BlockColor)
            //     world.blocks.coloring[xyzstr] = color
            //   } else {
            //     world.blocks.coloring[xyzstr] = `slategray`
            //   }
            // }

            spawnParticles(beamResult.edge, world.tick)

            for (let i = 1; i < particles.length; i++) {
              const p = particles[i]
              if (!p.mesh.parent) world.three?.scene.add(p.mesh)
            }
          }
        }),
      }),
      three: Three({
        init: async (_, world, three) => {

          // tracer
          const tracerGeometry = new CylinderGeometry(0.004, 0.004, 0.1, 8)
          tracer = new Mesh(tracerGeometry, new MeshPhongMaterial({ color: 0xffff99, emissive: 0xffff99 }))
          three.scene.add(tracer)

          // particles
          const particleMesh = new Mesh(new SphereGeometry(0.008, 6, 6))
          particleMesh.castShadow = true

          particles.push({ mesh: particleMesh, velocity: { x: 0, y: 0, z: 0 }, tick: 0, start: { x: 0, y: 0, z: 0 }, duration: 0 })

          // gun
          if (character.id === world.client?.character()?.id) {
            three.gLoader.load("deagle.glb", (gltf) => {
              mesh = gltf.scene
              mesh.scale.set(0.025, 0.025, 0.025)

              mesh.receiveShadow = true
              mesh.castShadow = true

              mesh.rotation.order = "YXZ"

              item.components.three?.o.push(mesh)
            })
          }
        },
        onRender: ({ world, delta, client, three }) => {
          const ratio = delta / 25

          const pos = character.components.position.interpolate(world, delta)

          let { aim } = character.components.position.data
          if (character.id === world.client?.character()?.id) {
            aim = client.controls.localAim
          }

          const offset = modelOffset(aim)

          // tracer
          if (tracer) {
            if (world.tick - tracerState.tick < 2) {
              tracer.visible = true
              tracer.position.set(
                tracerState.pos.x + tracerState.velocity.x * (world.tick - tracerState.tick + ratio),
                tracerState.pos.y + tracerState.velocity.y * (world.tick - tracerState.tick + ratio),
                tracerState.pos.z + tracerState.velocity.z * (world.tick - tracerState.tick + ratio)
              )
            } else {
              tracer.visible = false
            }
          }

          // particles
          for (let i = 1; i < particles.length; i++) {
            const p = particles[i]

            if (world.tick - p.tick >= p.duration) {
              if (p.mesh.parent) {
                world.three?.scene.remove(p.mesh)
              }
              particles.splice(i, 1)
              i--
            } else {
              p.mesh.position.set(
                p.start.x + p.velocity.x * (world.tick - p.tick + ratio),
                p.start.z + p.velocity.z * (world.tick - p.tick + ratio),
                p.start.y + p.velocity.y * (world.tick - p.tick + ratio)
              )
            }
          }

          if (!mesh) return

          if (three.camera.mode === "third" && character.id === world.client?.character()?.id) {
            mesh.visible = false
            return
          } else {
            mesh.visible = true
          }

          // gun
          mesh.position.copy({
            x: pos.x + offset.x,
            y: pos.z + 0.45 + offset.y,
            z: pos.y + offset.z
          })

          const { recoil } = character.components.position.data
          const localRecoil = recoil ? recoil - recoilRate * ratio : 0

          mesh.rotation.y = aim.x
          mesh.rotation.x = aim.y + localRecoil * 0.5

          if (item.components.gun.data.reloading) {
            const delta = item.components.gun.data.reloading - world.tick - ratio
            mesh.rotation.x = -(PI * 6) / 40 * delta
          }
        }
      })
    },
  })

  return item
}

type DeagleParams = {
  pos: XYZ
  aim: XY
  targets: Target[]
  rng: number
  error: XY
}
