import {
  Actions, Clickable, Effects, ElementKinds, Item, ItemActionParams, ItemBuilder, ItemEntity,
  Position, Renderable, ValidSounds, Whack, WhackBlock, XYZtoIJK, blocks, loadTexture
} from "@piggo-gg/core"
import { Sprite } from "pixi.js"

type ElementToDamage = Record<ElementKinds, number>

export type ToolProps = {
  name: string
  sound: ValidSounds
  damage: ElementToDamage
}

export const Tool = (
  { name, sound, damage }: ToolProps
): ItemBuilder => ({ character, id }): ItemEntity => ItemEntity({
  id: id ?? `${name}-${character.id}`,
  components: {
    position: Position({ follows: character?.id ?? "" }),
    actions: Actions({
      mb1: WhackBlock
      // mb1: Whack(sound, (e => {
      //   const { element } = e.components
      //   return damage[element?.data.kind ?? "flesh"]
      // }))
      // mb1: ({ params, world, player, entity }) => {
      //   const { hold, mouse } = params as ItemActionParams
      //   if (hold) return

      //   const character = player?.components.controlling.getCharacter(world)
      //   if (!character) return

      //   const { position } = entity?.components ?? {}
      //   if (!position) return

      //   const rotation = world.flipped() * (position.data.pointingDelta.x > 0 ? 1 : -1)
      //   position.rotate(rotation)

      //   const xyz = blocks.atMouse(mouse, character.components.position.data)?.block
      //   if (!xyz) {
      //     world.client?.soundManager.play("whiff")
      //     return
      //   }

      //   const spot = XYZtoIJK(xyz)
      //   blocks.remove(spot, world)

      //   world.client?.soundManager.play("clink")
      // },
    }),
    item: Item({ name, flips: true }),
    effects: Effects(),
    clickable: Clickable({
      width: 20, height: 20, active: false, anchor: { x: 0.5, y: 0.5 }
    }),
    renderable: Renderable({
      scaleMode: "nearest",
      zIndex: 4,
      scale: 2.5,
      anchor: { x: 0.5, y: 0.5 },
      interpolate: true,
      visible: false,
      rotates: true,
      setup: async (r: Renderable) => {
        const textures = await loadTexture(`${name}.json`)
        r.c = new Sprite(textures["0"])

        r.setOutline({ color: 0x000000, thickness: 1 })
      }
    })
  }
})

export const Axe = Tool({ name: "axe", sound: "thud", damage: { flesh: 15, wood: 25, rock: 10 } })
export const Sword = Tool({ name: "sword", sound: "slash", damage: { flesh: 25, wood: 10, rock: 10 } })
export const Pickaxe = Tool({ name: "pickaxe", sound: "clink", damage: { flesh: 10, wood: 10, rock: 25 } })
