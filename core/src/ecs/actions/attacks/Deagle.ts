import { Action, Actions, Character, Effects, Input, Item, ItemEntity, Networked, Position, StrikeState, Target, XY, XYZ } from "@piggo-gg/core"
import { Object3D } from "three"


export const DeagleItem = ({ character }: { character: Character }) => {

  let gun: undefined | Object3D = undefined

  const { inventory } = character.components

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

            return { actionId: "laser", params: { pos, aim, targets } }
          },
        }
      }),
      actions: Actions({
        deagle: Deagle(),
      }),
    },
  })

  return item
}

type DeagleParams = {
  pos: XYZ
  aim: XY
  targets: Target[]
}

const Deagle = () => Action<DeagleParams>("deagle", ({ world, entity, params }) => {
  if (!entity) return

  const state = world.state<StrikeState>()

  // if (state.hit[entity.id]) return
  const cd = world.tick - (state.lastShot[entity.id] ?? 0)
  if (cd < 20) return

  state.lastShot[entity.id] = world.tick

  const { pos, aim, targets } = params
})
