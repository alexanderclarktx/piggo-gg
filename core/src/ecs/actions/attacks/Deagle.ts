import {
  Action, Actions, blockInLine, Character, cos, Effects, Input, Item, ItemEntity,
  max, min, Networked, NPC, playerForCharacter, Position, random, randomInt, sin,
  sqrt, StrikeState, Target, Three, XY, XYZ, XYZdistance, XYZdot, XYZsub
} from "@piggo-gg/core"
import { Color, CylinderGeometry, Mesh, MeshPhongMaterial, Object3D, SphereGeometry, Vector3 } from "three"

const modelOffset = (localAim: XY, tip: boolean = false): XYZ => {
  const dir = { x: sin(localAim.x), y: cos(localAim.x), z: sin(localAim.y) }
  const right = { x: cos(localAim.x), y: -sin(localAim.x) }

  const offset = {
    x: -dir.x * 0.05 + right.x * 0.05,
    y: 0,
    z: -dir.y * 0.05 + right.y * 0.05,
  }

  if (tip) {
    offset.x -= dir.x * 0.1
    offset.y -= 0.035 - localAim.y * 0.1,
      offset.z -= dir.y * 0.1
  }

  return offset
}

export const DeagleItem = ({ character }: { character: Character }) => {

  let gun: Object3D | undefined = undefined
  let tracer: Object3D | undefined = undefined

  let tracerState = { tick: 0, velocity: { x: 0, y: 0, z: 0 }, pos: { x: 0, y: 0, z: 0 } }

  const particles: { mesh: Mesh, velocity: XYZ, tick: number }[] = []

  let recoil = 0
  const recoilRate = 0.05

  const spawnParticles = (pos: XYZ, tick: number) => {
    const proto = particles[0]
    if (!proto) return

    for (let i = 0; i < 20; i++) {
      const mesh = proto.mesh.clone()
      const velocity = new Vector3((random() - 0.5) * 0.5, (random() - 0.5) * 0.5, (random() - 0.5) * 0.5).normalize().multiplyScalar(0.012)

      // vary the color
      const green = Math.floor(randomInt(256))
      const color = new Color(`rgb(255, ${green}, 0)`)
      mesh.material = new MeshPhongMaterial({ color, emissive: color })

      mesh.position.set(pos.x, pos.z, pos.y)

      particles.push({ mesh, tick, velocity })
    }
  }

  const item = ItemEntity({
    id: `deagle-${character.id}`,
    components: {
      position: Position(),
      effects: Effects(),
      networked: Networked(),
      item: Item({ name: "deagle", stackable: false }),
      input: Input({
        press: {
          "mb1": ({ hold, character, world, aim, client }) => {
            if (hold) return
            if (!character) return
            if (!document.pointerLockElement && !client.mobile) return
            if (world.client?.mobileMenu) return

            const targets: Target[] = world.characters()
              .filter(c => c.id !== character.id)
              .map(target => ({
                ...target.components.position.xyz(),
                id: target.id
              }))

            const pos = character.components.position.xyz()

            return { actionId: "deagle", params: { pos, aim, targets } }
          },
        }
      }),
      npc: NPC({
        behavior: () => {
          if (recoil > 0) recoil = max(0, recoil - recoilRate)
        }
      }),
      actions: Actions({
        deagle: Action<DeagleParams>("deagle", ({ world, entity, params }) => {
          if (!entity) return

          const state = world.state<StrikeState>()

          const cd = world.tick - (state.lastShot[entity.id] ?? 0)
          if (cd < 5) return

          state.lastShot[entity.id] = world.tick

          world.client?.sound.play({ name: "deagle", threshold: { pos: params.pos, distance: 5 } })

          if (gun) {
            recoil = min(0.8, recoil + 0.5)
          }

          const { pos, aim, targets } = params

          const eyePos = { x: pos.x, y: pos.y, z: pos.z + 0.5 }
          const eyes = new Vector3(eyePos.x, eyePos.z, eyePos.y)

          const target = new Vector3(
            -sin(aim.x) * cos(aim.y), sin(aim.y), -cos(aim.x) * cos(aim.y)
          ).normalize().multiplyScalar(10).add(eyes)

          const dir = target.clone().sub(eyes).normalize()

          const { localAim } = world.client!.controls
          const offset = modelOffset(localAim, true)

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

          // raycast against blocks
          const beamResult = blockInLine({ from: eyePos, dir, world, cap: 60, maxDist: 30 })
          if (beamResult) {
            // world.blocks.remove(beamResult.inside)

            spawnParticles(beamResult.edge, world.tick)

            for (let i = 1; i < particles.length; i++) {
              const p = particles[i]
              if (!p.mesh.parent) world.three?.scene.add(p.mesh)
            }
          }

          // raycast against characters
          for (const target of targets) {
            const targetEntity = world.entity<Position>(target.id)
            if (!targetEntity) continue

            const targetXYZ = { x: target.x, y: target.y, z: target.z + 0.05 }

            const L = XYZsub(targetXYZ, eyePos)
            const tc = XYZdot(L, { x: dir.x, y: dir.z, z: dir.y })

            if (tc < 0) continue

            const Ldist = XYZdistance(targetXYZ, eyePos)
            const D = sqrt((Ldist * Ldist) - (tc * tc))

            if (D > 0 && D < 0.08) {
              const targetPlayer = playerForCharacter(world, target.id)
            }
          }
        }),
      }),
      three: Three({
        init: async (_, __, three) => {

          // tracer
          const tracerGeometry = new CylinderGeometry(0.004, 0.004, 0.04, 8)
          tracer = new Mesh(tracerGeometry, new MeshPhongMaterial({ color: 0xffffff, visible: true }))
          three.scene.add(tracer)

          // particles
          const particleMesh = new Mesh(new SphereGeometry(0.008, 6, 6))
          particleMesh.castShadow = true

          particles.push({ mesh: particleMesh, velocity: { x: 0, y: 0, z: 0 }, tick: 0 })

          // gun
          three.gLoader.load("deagle.glb", (gltf) => {
            gun = gltf.scene
            gun.scale.set(0.03, 0.03, 0.03)

            gun.receiveShadow = true
            gun.castShadow = true

            gun.rotation.order = "YXZ"

            three.scene.add(gun)
          })
        },
        onRender: ({ world, delta }) => {
          if (!gun) return

          const ratio = delta / 25

          const pos = character.components.position.interpolate(world, delta)

          const { localAim } = world.client!.controls
          const offset = modelOffset(localAim)

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

          gun.position.copy({
            x: pos.x + offset.x,
            y: pos.z + 0.45 + offset.y,
            z: pos.y + offset.z
          })

          for (let i = 1; i < particles.length; i++) {
            const p = particles[i]
            p.mesh.position.add(new Vector3(p.velocity.x, p.velocity.z, p.velocity.y))

            if (world.tick - p.tick >= 5) {
              if (p.mesh.parent) world.three?.scene.remove(p.mesh)
              particles.splice(i, 1)
              i--
            }
          }

          const localRecoil = recoil ? recoil - recoilRate * ratio : 0

          gun.rotation.y = localAim.x
          gun.rotation.x = localAim.y + localRecoil
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
}
