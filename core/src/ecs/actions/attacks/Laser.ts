import {
  Action, Actions, cos, DDEState, Effects, floor, hypot, Input,
  Item, ItemEntity, min, Networked, playerForCharacter, Position,
  sin, sqrt, Three, XY, XYZ, XYZdistance, XYZdot, XYZsub
} from "@piggo-gg/core"
import { CylinderGeometry, Mesh, MeshBasicMaterial, Object3DEventMap, Vector3 } from "three"

export type Target = XYZ & { id: string }

export type LaserParams = {
  pos: XYZ
  aim: XY
  targets: Target[]
}

export type LaserMesh = Mesh<CylinderGeometry, MeshBasicMaterial, Object3DEventMap>

export const LaserMesh = (): LaserMesh => {
  const geometry = new CylinderGeometry(0.01, 0.01, 1, 8)
  geometry.translate(0, 0.5, 0)

  const material = new MeshBasicMaterial({ color: 0xff0000, transparent: true, side: 2 })

  const mesh = new Mesh(geometry, material)
  mesh.scale.y = 14

  return mesh
}

export const LaserItem = () => {

  const mesh = LaserMesh()

  const item = ItemEntity({
    id: "Laser",
    components: {
      position: Position(),
      effects: Effects(),
      networked: Networked(),
      item: Item({ name: "Laser", stackable: false }),
      actions: Actions({
        laser: Laser(mesh),
      }),
      input: Input({
        press: {
          "mb1": ({ hold, character, world, aim, client }) => {
            if (hold) return null
            if (!character) return null
            if (!document.pointerLockElement && !client.mobile) return null

            const targets: Target[] = world.characters()
              .filter(c => c.id !== character.id)
              .map(target => ({
                ...target.components.position.xyz(),
                id: target.id
              }))

            const pos = character.components.position.xyz()

            if (world.three!.camera.mode === "first") {
              // aim.x *= 2
              // aim.y *= 2
            }

            return { actionId: "laser", params: { pos, aim, targets } }
          },
        }
      }),
      three: Three({
        init: async (entity) => {
          entity.components.three.o.push(mesh)
        },
        onRender: ({ delta }) => {
          const ratio = delta / 25

          mesh.material.opacity -= 0.05 * ratio
          if (mesh.material.opacity <= 0) mesh.visible = false
        }
      })
    }
  })
  return item
}

export const Laser = (mesh: LaserMesh) => Action<LaserParams>("laser", ({ world, params, entity, player, client }) => {
  if (!entity) return

  const state = world.state<DDEState>()

  if (state.hit[entity.id]) return

  const cd = world.tick - (state.lastShot[entity.id] ?? 0)
  if (cd < 20) return

  state.lastShot[entity.id] = world.tick

  const { pos, aim } = params

  client.sound.play({ name: "laser1", threshold: { pos, distance: 5 } })

  const eyePos = { x: pos.x, y: pos.y, z: pos.z + 0.13 }
  const eyes = new Vector3(eyePos.x, eyePos.z, eyePos.y)

  const target = new Vector3(
    -sin(aim.x) * cos(aim.y), sin(aim.y), -cos(aim.x) * cos(aim.y)
  ).normalize().multiplyScalar(10).add(eyes)

  const dir = target.clone().sub(eyes).normalize()

  // update laser mesh
  const offset = new Vector3(-sin(params.aim.x), 0, -cos(params.aim.x)).normalize()
  mesh.position.copy(eyes.add(offset.multiplyScalar(.03)))
  mesh.position.copy(eyes)
  mesh.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), dir)

  mesh.updateMatrix()
  mesh.material.opacity = 1
  mesh.visible = true

  const current = { ...eyePos }

  let travelled = 0
  let cap = 40

  while (travelled < 10 && cap > 0) {

    const xGap = (current.x + 0.15) % 0.3
    const yGap = (current.y + 0.15) % 0.3
    const zGap = current.z % 0.3

    // find step size to hit next block
    const xStep = dir.x > 0 ? (0.3 - xGap) / dir.x : (xGap / -dir.x)
    const yStep = dir.z > 0 ? (0.3 - yGap) / dir.z : (yGap / -dir.z)
    const zStep = dir.y > 0 ? (0.3 - zGap) / dir.y : (zGap / -dir.y)

    const minStep = min(xStep, yStep, zStep)

    const xDist = dir.x * minStep * 1.01
    const yDist = dir.z * minStep * 1.01
    const zDist = dir.y * minStep * 1.01

    current.x += xDist
    current.y += yDist
    current.z += zDist

    travelled += hypot(xDist, yDist, zDist)
    cap -= 1

    const insideBlock = {
      x: floor((0.15 + current.x) / 0.3),
      y: floor((0.15 + current.y) / 0.3),
      z: floor(current.z / 0.3)
    }

    if (world.blocks.atIJK(insideBlock)) {
      world.blocks.remove(insideBlock)
      break
    }
  }

  // if (world.client && entity.id !== world.client.character()?.id) return
  // if (world.client) return

  const targets = params.targets as Target[]
  for (const target of targets) {
    if (state.hit[target.id]) continue
    const targetEntity = world.entity<Position>(target.id)
    if (!targetEntity) continue

    const targetXYZ = { x: target.x, y: target.y, z: target.z + 0.05 }

    const L = XYZsub(targetXYZ, eyePos)
    const tc = XYZdot(L, { x: dir.x, y: dir.z, z: dir.y })

    if (tc < 0) continue

    const Ldist = XYZdistance(targetXYZ, eyePos)
    const D = sqrt((Ldist * Ldist) - (tc * tc))

    if (D > 0 && D < 0.08) {
      state.hit[target.id] = { tick: world.tick, by: entity.id }
      const targetPlayer = playerForCharacter(world, target.id)
      world.announce(`${player?.components.pc.data.name} hit ${targetPlayer?.components.pc.data.name}`)

      targetEntity.components.position.data.flying = false
    }
  }
})
