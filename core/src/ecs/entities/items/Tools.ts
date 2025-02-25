import {
  Actions, Clickable, Effects, ElementKinds, Item, ItemBuilder, ItemEntity,
  Position, Renderable, ValidSounds, Whack, loadTexture
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
      mb1: Whack(sound, (e => {
        const { element } = e.components
        return damage[element?.data.kind ?? "flesh"]
      }))
    }),
    item: Item({ name, flips: true }),
    effects: Effects(),
    clickable: Clickable({
      width: 20, height: 20, active: false, anchor: { x: 0.5, y: 0.5 }
    }),
    renderable: Renderable({
      scaleMode: "nearest",
      zIndex: 3,
      scale: 2.5,
      anchor: { x: 0.5, y: 0.5 },
      interpolate: true,
      visible: false,
      rotates: true,
      outline: { color: 0x000000, thickness: 1 },
      setup: async (r: Renderable) => {
        const textures = await loadTexture(`${name}.json`)

        r.c = new Sprite(textures["0"])
      }
    })
  }
})

export const Axe = Tool({ name: "axe", sound: "thud", damage: { flesh: 15, wood: 25, rock: 10 } })
export const Sword = Tool({ name: "sword", sound: "slash", damage: { flesh: 25, wood: 10, rock: 10 } })
export const Pickaxe = Tool({ name: "pickaxe", sound: "clink", damage: { flesh: 10, wood: 10, rock: 25 } })
