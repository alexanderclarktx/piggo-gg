import { Action, Actions, blockInLine, Character, Effects, Input, Item, ItemEntity, Networked, NPC, Position, Three, XYZ, XYZnormal } from "@piggo-gg/core"
import { CylinderGeometry, Mesh, MeshBasicMaterial } from "three"

const HookMesh = (): Mesh => {
  const geometry = new CylinderGeometry(0.01, 0.01, 1, 8)
  geometry.translate(0, 0.5, 0)

  const material = new MeshBasicMaterial({ color: 0x964B00 })

  const mesh = new Mesh(geometry, material)
  mesh.scale.y = 14

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
          const position = item.components.position.data
          const characterPos = character.components.position.data
          if (!characterPos.tether) {
            mesh.visible = false
            return
          }
          mesh.visible = true

          const dx = characterPos.tether.x - position.x
          const dy = characterPos.tether.y - position.y
          const dz = characterPos.tether.z - position.z

          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
          // mesh.scale.y = dist / 2
          mesh.scale.y = 2

          mesh.position.set(
            (characterPos.tether.x),
            (characterPos.tether.z),
            (characterPos.tether.y),
          )

          // const midx = (characterPos.tether.x + position.x) / 2
          // const midy = (characterPos.tether.y + position.y) / 2
          // const midz = (characterPos.tether.z + position.z) / 2
          // mesh.position.set(midx, midy, midz)

          // const { x: nx, y: ny, z: nz } = XYZnormal({ x: dx, y: dy, z: dz })
          // const phi = Math.acos(ny)
          // let theta = Math.atan2(nz, nx)
          // if (theta < 0) theta += Math.PI * 2
          // mesh.rotation.set(0, 0, 0)
          // mesh.rotateY(theta)
          // mesh.rotateZ(phi + Math.PI / 2)

          // rotate to face player
          // mesh.lookAt(characterPos.x, characterPos.y, characterPos.z)
          // mesh.rotateX(Math.PI / 2)
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

  console.log(character?.id)


  const beamResult = blockInLine({ from: camera, dir, world, cap: 40 })
  if (beamResult) {
    console.log(beamResult.inside)

    hooked = true

    if (character) character.components.position.data.tether = {
      x: beamResult.inside.x * 0.3,
      y: beamResult.inside.y * 0.3,
      z: beamResult.inside.z * 0.3 + 0.15
    }
  }
})
