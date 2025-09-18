import {
  Action, Actions, Character, cos, VillagersState, Effects, hypot, Input,
  Item, ItemEntity, min, Networked, playerForCharacter, Position, sin,
  sqrt, Three, XY, XYZ, XYZdistance, XYZdot, XYZsub, blockInLine
} from "@piggo-gg/core"
import { CylinderGeometry, Mesh, MeshBasicMaterial, Object3D, Object3DEventMap, Vector3 } from "three"

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

  const material = new MeshBasicMaterial({ color: 0xff0000, transparent: true })

  const mesh = new Mesh(geometry, material)
  mesh.scale.y = 14

  return mesh
}

export const LaserItem = ({ character }: { character: Character }) => {

  const mesh = LaserMesh()

  let gun: undefined | Object3D = undefined

  const { inventory } = character.components

  const item = ItemEntity({
    id: `laser-${character.id}`,
    components: {
      position: Position(),
      effects: Effects(),
      networked: Networked(),
      item: Item({ name: "laser", stackable: false }),
      actions: Actions({
        laser: Laser(mesh),
      }),
      input: Input({
        press: {
          "mb1": ({ hold, character, world, aim, client }) => {
            if (hold) return null
            if (!character) return null
            if (!document.pointerLockElement && !client.mobile) return null
            if (world.client?.mobileLock) return null

            const targets: Target[] = world.characters()
              .filter(c => c.id !== character.id)
              .map(target => ({
                ...target.components.position.xyz(),
                id: target.id
              }))

            const pos = character.components.position.xyz()

            return { actionId: "laser", params: { pos, aim, targets } }
          },
        }
      }),
      three: Three({
        init: async (entity, _, three) => {
          entity.components.three.o.push(mesh)

          three.gLoader.load("laser-gun.glb", (gltf) => {
            gun = gltf.scene
            gun.scale.set(0.03, 0.03, 0.03)
            gun.rotation.order = "YXZ"
            // gun.rotation.y = Math.PI
            // gun.position.set(0.1, -0.15, -0.25)
            // mesh.add(gun)

            gun.receiveShadow = true
            gun.castShadow = true
            three.scene.add(gun)
          })
        },
        onRender: ({ world, delta }) => {

          if (inventory!.activeItem(world)?.id !== item.id || world.three?.camera.mode === "third") {
            if (gun) gun.visible = false
          } else {
            if (gun) gun.visible = true
          }

          const ratio = delta / 25

          mesh.material.opacity -= 0.05 * ratio
          if (mesh.material.opacity <= 0) mesh.visible = false

          if (!gun) return
          const xyz = character.components.position.interpolate(world, delta)

          const { localAim } = world.client!.controls

          const dir = { x: sin(localAim.x), y: cos(localAim.x), z: sin(localAim.y) }
          const right = {x: cos(localAim.x), y: -sin(localAim.x) }

          const gunPos = {
            x: xyz.x - dir.x * 0.05 + right.x * 0.05,
            y: xyz.z + 0.45 + dir.z * 0.02,
            z: xyz.y - dir.y * 0.05 + right.y * 0.05,
          }

          gun.position.copy(gunPos)

          gun.rotation.y = localAim.x
          gun.rotation.x = localAim.y
        }
      })
    }
  })
  return item
}

const Laser = (mesh: LaserMesh) => Action<LaserParams>("laser", ({ world, params, entity, player }) => {
  if (!entity) return

  const state = world.state<VillagersState>()

  if (state.hit[entity.id]) return

  const cd = world.tick - (state.lastShot[entity.id] ?? 0)
  if (cd < 20) return

  state.lastShot[entity.id] = world.tick

  const { pos, aim } = params

  world.client?.sound.play({ name: "laser1", threshold: { pos, distance: 5 } })

  const eyePos = { x: pos.x, y: pos.y, z: pos.z + 0.5 }
  const eyes = new Vector3(eyePos.x, eyePos.z, eyePos.y)

  const target = new Vector3(
    -sin(aim.x) * cos(aim.y), sin(aim.y), -cos(aim.x) * cos(aim.y)
  ).normalize().multiplyScalar(10).add(eyes)

  // update laser mesh
  let offsetScale = 0.03
  if (world.client && player?.id === world.client?.playerId() && world.three?.camera.mode === "first") {
    const { x, y, z } = entity.components.position?.localVelocity ?? { x: 0, y: 0, z: 0 }
    const speed = hypot(x, y, z)
    offsetScale = min(1, (1.5 - speed))
  }

  const offset = new Vector3(
    -sin(aim.x) * cos(aim.y), sin(aim.y), -cos(aim.x) * cos(aim.y)
  ).normalize().multiplyScalar(offsetScale)

  mesh.position.copy(eyes.add(offset))

  const dir = target.clone().sub(eyes).normalize()
  mesh.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), dir)

  mesh.updateMatrix()
  mesh.material.opacity = 1
  mesh.visible = true

  const beamResult = blockInLine({ from: eyePos, dir, world, cap: 40 })
  if (beamResult) {
    world.blocks.remove(beamResult.inside)
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
