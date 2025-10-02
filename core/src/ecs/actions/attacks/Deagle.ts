import { Action, Actions, Character, cos, Effects, Input, Item, ItemEntity, max, min, Networked, Position, sin, StrikeState, Target, Three, XY, XYZ } from "@piggo-gg/core"
import { Object3D } from "three"

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

  let gun: undefined | Object3D = undefined

  const { inventory } = character.components

  let recoil = 0

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

            console.log("DEAGLE SHOOT", { hold, character, world, aim, client })

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
        }),
      }),
      three: Three({
        init: async (_, __, three) => {
          three.gLoader.load("laser-gun.glb", (gltf) => {
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

          gun.visible = inventory?.activeItem(world)?.id === item.id &&
            world.three?.camera.mode === "first" && world.three?.camera.transition >= 100

          const pos = character.components.position.interpolate(world, delta)

          const { localAim } = world.client!.controls
          const offset = modelOffset(localAim)

          gun.position.copy({
            x: pos.x + offset.x,
            y: pos.z + 0.45 + offset.y,
            z: pos.y + offset.z
          })

          gun.rotation.y = localAim.x
          gun.rotation.x = localAim.y + recoil

          if (recoil >= 0) recoil = max(0, recoil - 0.025)
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
