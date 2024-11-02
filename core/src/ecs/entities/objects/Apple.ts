import {
  Actions, Clickable, Collider, Debug, Item, Effects, Element,
  Food, Health, ItemEntity, Networked, Position,
  Renderable, XY, loadTexture, randomInt, NPC
} from "@piggo-gg/core"
import { Sprite } from "pixi.js"

export type AppleProps = {
  id?: string
  position?: XY
}

export const Apple = ({ position, id }: AppleProps = {}) => ItemEntity({
  id: id ?? `apple-${randomInt(1000)}`,
  components: {
    position: Position(position ?? { x: randomInt(1000, 500), y: randomInt(1000, 500) }),
    networked: Networked({ isNetworked: true }),
    collider: Collider({
      shape: "ball",
      frictionAir: 0.6,
      radius: 5,
      hittable: false
    }),
    npc: NPC({
      behavior: (e) => {
        if (e.components.item?.dropped === false) return

        const { x, y } = e.components.position.data.velocity
        e.components.position.data.rotation += 0.001 * Math.sqrt((x * x) + (y * y))
      }
    }),
    item: Item({ name: "apple", dropped: true, stackable: true }),
    actions: Actions(),
    effects: Effects(),
    clickable: Clickable({
      width: 16, height: 16, active: true, anchor: { x: 0.5, y: 0.5 }
    }),
    element: Element("wood"),
    food: Food({ hunger: 3 }),
    health: Health({ health: 100 }),
    renderable: Renderable({
      zIndex: 3,
      scale: 1,
      scaleMode: "nearest",
      interpolate: true,
      cullable: true,
      rotates: true,
      anchor: { x: 0.5, y: 0.6 },
      setup: async (r: Renderable) => {

        const texture = (await loadTexture("apple.json"))["0"]
        const sprite = new Sprite(texture)

        r.c = sprite
      }
    })
  }
})
