import {
  Actions, Clickable, Collider, Debug, Droppable, Effects, Element,
  Food, Health, Item, Name, Networked, Pickup, Position,
  Renderable, XY, loadTexture, randomInt
} from "@piggo-gg/core"
import { Sprite } from "pixi.js"

export type AppleProps = {
  id?: string
  position?: XY
}

export const Apple = ({ position, id }: AppleProps = {}) => {
  const apple = Item({
    id: id ?? `apple-${randomInt(1000)}`,
    components: {
      name: Name("apple"),
      position: Position(position ?? { x: randomInt(1000, 500), y: randomInt(1000, 500) }),
      networked: Networked({ isNetworked: true }),
      collider: Collider({
        shape: "ball",
        isStatic: true,
        radius: 6,
        hittable: false
      }),
      droppable: Droppable(true),
      actions: Actions({ pickup: Pickup }),
      clickable: Clickable({
        width: 16, height: 16, active: true, anchor: { x: 0.5, y: 0.5 },
        click: () => ({ action: "pickup" }),
        hoverOver: (world) => {
          apple.components.renderable.setOutline(0xffffff, 2)

          // const { x, y } = apple.components.position.data
          // const tooltip = Entity({
          //   id: "tooltip",
          //   components: {
          //     position: Position({ x, y: y - 20, screenFixed: false }),
          //     renderable: Renderable({
          //       zIndex: 10,
          //       scale: 1,
          //       scaleMode: "nearest",
          //       cullable: true,
          //       setContainer: async () => {
          //         const texture = (await loadTexture("key.json"))["0"]
          //         return new Sprite({ texture, anchor: { x: 0.5, y: 0.5 } })
          //       }
          //     })
          //   }
          // })
          // world.addEntity(tooltip)
        },
        hoverOut: () => {
          apple.components.renderable.setOutline(0xffffff, 0)
        },
      }),
      effects: Effects(),
      element: Element("wood"),
      food: Food({ hunger: 3 }),
      health: Health({ health: 100 }),
      debug: Debug(),
      renderable: Renderable({
        zIndex: 3,
        scale: 1,
        scaleMode: "nearest",
        cullable: true,
        setup: async (r: Renderable) => {

          const texture = (await loadTexture("apple.json"))["0"]
          const sprite = new Sprite(texture)

          sprite.anchor.set(0.5, 0.6)

          r.c = sprite
        }
      })
    }
  })
  return apple
}
