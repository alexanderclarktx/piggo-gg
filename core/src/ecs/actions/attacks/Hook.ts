import { Action, Actions, blockInLine, Character, Effects, Input, Item, ItemEntity, Networked, NPC, Position, Three, XYZ, XYZdistance, XYZnormal } from "@piggo-gg/core"
import { CylinderGeometry, Mesh, MeshBasicMaterial, Quaternion, Vector3 } from "three"

const HookMesh = (): Mesh => {
  const geometry = new CylinderGeometry(0.01, 0.01, 1, 8)
  geometry.translate(0, 0.5, 0)

  const material = new MeshBasicMaterial({ color: 0x964B00 })

  const mesh = new Mesh(geometry, material)
  // mesh.scale.y = 14

  return mesh
}

export const HookItem = ({ character }: { character: Character }) => {

  const mesh = HookMesh()

  const item = ItemEntity({
    id: `hook-${character.id}`,
    components: {
      position: Position(),
      effects: Effects(),
      networked: Networked(),
      item: Item({ name: "hook", stackable: false }),
      actions: Actions({
        hook: Hook(mesh),
      }),
      input: Input({
        press: {
          "mb1": ({ hold, character, world, client }) => {
            if (hold) return null
            if (!character) return null
            if (!document.pointerLockElement && !client.mobile) return null
            if (world.client?.mobileLock) return null

            const dir = world.three!.camera.dir(world)
            const camera = world.three!.camera.pos()
            const pos = character.components.position.xyz()

            return { actionId: "hook", params: { dir, camera, pos } }
          }
        }
      }),
      three: Three({
        init: async (entity) => {
          entity.components.three.o.push(mesh)
        },
        onRender: ({ delta }) => {
          // mesh needs to be between tether position and player
          const characterPos = character.components.position.data
          if (!characterPos.tether) {
            mesh.visible = false
            return
          }
          mesh.visible = true

          const dx = characterPos.tether.x - characterPos.x
          const dy = characterPos.tether.y - characterPos.y
          const dz = characterPos.tether.z - characterPos.z

          const dist = XYZdistance(characterPos, characterPos.tether)
          mesh.scale.y = dist

          mesh.position.set(characterPos.x, characterPos.z, characterPos.y)

          const up = new Vector3(0, 1, 0)
          const dir = new Vector3(dx, dz, dy).normalize()
          const quat = new Quaternion().setFromUnitVectors(up, dir)
          mesh.quaternion.copy(quat)
        }
      })
    }
  })

  return item
}

type HookParams = {
  camera: XYZ
  dir: XYZ
  pos: XYZ
}

let hooked = false

const Hook = (mesh: Mesh) => Action<HookParams>("hook", ({ world, params, character }) => {
  const { pos, dir, camera } = params

  if (hooked) {
    hooked = false
    if (character) character.components.position.data.tether = undefined
    return
  }

  const beamResult = blockInLine({ from: camera, dir, world, cap: 40 })
  if (beamResult) {
    console.log(beamResult.inside)

    hooked = true

    if (world.client?.sound) world.client.sound.play({ name: "click3" })

    if (character) character.components.position.data.tether = {
      x: beamResult.inside.x * 0.3,
      y: beamResult.inside.y * 0.3,
      z: beamResult.inside.z * 0.3 + 0.15,
      dist: XYZdistance(pos, {
        x: beamResult.inside.x * 0.3,
        y: beamResult.inside.y * 0.3,
        z: beamResult.inside.z * 0.3 + 0.15
      })
    }
  }
})
