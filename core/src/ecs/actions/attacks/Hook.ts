import { Action, Actions, blockInLine, Character, Effects, Input, Item, ItemEntity, Networked, Position, Three, XYZ } from "@piggo-gg/core"
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
        release: {
          "mb1": () => {
            console.log("mb1 release")
            return null
          }
        },
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
          // const ratio = delta / 25

          // mesh.material.opacity -= 0.05 * ratio
          // if (mesh.material.opacity <= 0) mesh.visible = false
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

let hooked: false | XYZ = false

const Hook = (mesh: Mesh) => Action<HookParams>("hook", ({ world, params }) => {
  const { pos, dir, camera } = params

  const beamResult = blockInLine({ from: camera, dir, world })
  if (beamResult) {
    console.log(beamResult.inside)

    hooked = beamResult.inside
  }
})
