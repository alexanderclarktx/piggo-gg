import {
  Actions, Clickable, Effects, Gun, GunBuilder, GunNames, Item, ItemBuilder,
  ItemEntity, Position, Reload, Renderable, Shoot, SpawnHitbox,
  abs, hypot, loadTexture, min
} from "@piggo-gg/core"
import { AnimatedSprite } from "pixi.js"

export const GunItem = (name: string, gun: () => Gun): ItemBuilder => (character) => ItemEntity({
  id: name,
  components: {
    position: Position({ follows: character.id }),
    actions: Actions({
      spawnHitbox: SpawnHitbox,
      mb1: Shoot,
      reload: Reload
    }),
    gun: gun(),
    effects: Effects(),
    item: Item({ name }),
    clickable: Clickable({ width: 0, height: 0, active: false }),
    renderable: Renderable({
      scaleMode: "nearest",
      zIndex: 2,
      scale: 2,
      anchor: { x: 0.5, y: 0.5 },
      interpolate: true,
      visible: false,
      outline: { color: 0x000000, thickness: 1 },
      dynamic: (_, r) => {
        const { pointing, pointingDelta } = character.components.position.data

        const hypotenuse = hypot(pointingDelta.x, pointingDelta.y)

        const hyp_x = pointingDelta.x / hypotenuse
        const hyp_y = pointingDelta.y / hypotenuse

        r.position = {
          x: hyp_x * min(20, abs(pointingDelta.x)),
          y: hyp_y * min(20, abs(pointingDelta.y)) - 5
        }

        r.zIndex = (pointingDelta.y > 0) ? 3 : 2

        r.bufferedAnimation = pointing.toString()
      },
      setup: async (r: Renderable) => {
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
  bulletSize: 5,
  speed: 600
})

export const WeaponTable: Record<GunNames, () => Gun> = {
  "deagle": DeagleBuilder,
  "ak": AKBuilder,
  "awp": AWPBuilder
}

export const Deagle = GunItem("deagle", WeaponTable["deagle"])
export const AK = GunItem("ak", WeaponTable["ak"])
export const AWP = GunItem("awp", WeaponTable["awp"])
