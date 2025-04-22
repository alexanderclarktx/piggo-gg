import {
  Actions, Clickable, Effects, Gun, GunBuilder, GunNames, Item, ItemBuilder,
  ItemEntity, Position, Reload, Renderable, Shoot, loadTexture
} from "@piggo-gg/core"
import { AnimatedSprite } from "pixi.js"

export const GunItem = (name: string, gun: () => Gun): ItemBuilder => ({ id, character }) => ItemEntity({
  id: id ?? `${name}-${character.id}`,
  components: {
    position: Position({ follows: character?.id ?? "" }),
    actions: Actions({
      mb1: Shoot,
      reload: Reload
    }),
    gun: gun(),
    effects: Effects(),
    item: Item({ name }),
    clickable: Clickable({
      width: 20, height: 20, active: false, anchor: { x: 0.5, y: 0.5 }
    }),
    renderable: Renderable({
      scaleMode: "nearest",
      zIndex: 3,
      scale: 2,
      anchor: { x: 0.5, y: 0.5 },
      interpolate: true,
      visible: false,
      onTick:({ renderable, entity }) => {
        if (entity.components.item!.dropped) return

        const { pointing } = entity.components.position?.data ?? {}
        if (pointing !== undefined) renderable.bufferedAnimation = pointing.toString()
      },
      setup: async (r: Renderable) => {
        r.setOutline({ color: 0x000000, thickness: 1 })

        const textures = await loadTexture(`${name}.json`)

        r.animations = {
          "0": new AnimatedSprite([textures["0"]]),
          "1": new AnimatedSprite([textures["1"]]),
          "2": new AnimatedSprite([textures["2"]]),
          "3": new AnimatedSprite([textures["3"]]),
          "4": new AnimatedSprite([textures["4"]]),
          "5": new AnimatedSprite([textures["5"]]),
          "6": new AnimatedSprite([textures["6"]]),
          "7": new AnimatedSprite([textures["7"]]),
        }
      }
    })
  }
})

const DeagleBuilder = GunBuilder({
  name: "deagle",
  automatic: false,
  ammo: 60,
  clipSize: 15,
  damage: 15,
  fireRate: 3,
  reloadTime: 40,
  bulletSize: 3,
  speed: 400
})

const AKBuilder = GunBuilder({
  name: "ak",
  automatic: true,
  ammo: 90,
  clipSize: 30,
  damage: 25,
  fireRate: 10,
  reloadTime: 50,
  bulletSize: 3,
  speed: 500
})

const AWPBuilder = GunBuilder({
  name: "awp",
  automatic: false,
  ammo: 20,
  clipSize: 1,
  damage: 200,
  fireRate: 40,
  reloadTime: 40,
  bulletSize: 4,
  speed: 600
})

export const Deagle = GunItem("deagle", DeagleBuilder)
export const AK = GunItem("ak", AKBuilder)
export const AWP = GunItem("awp", AWPBuilder)

export const GunsTable: Record<GunNames, ItemBuilder> = {
  "deagle": Deagle,
  "ak": AK,
  "awp": AWP
}
