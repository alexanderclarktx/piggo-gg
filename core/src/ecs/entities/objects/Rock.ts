import {
  Collider, Debug, Element, Entity, Health, NPC, Networked,
  Position, Renderable, XY, loadTexture, randomInt
} from "@piggo-gg/core"
import { Sprite } from "pixi.js"

export type RockProps = {
  id?: string
  position?: XY
}

export const Rock = ({ position, id }: RockProps = {}) => Entity<Renderable>({
  id: id ?? `rock-${randomInt(1000)}`,
  components: {
    position: Position(position ?? { x: randomInt(1000, 500), y: randomInt(1000, 500) }),
    networked: Networked({ isNetworked: true }),
    collider: Collider({
      shape: "ball",
      isStatic: true,
      radius: 8,
      hittable: true
    }),
    element: Element("rock"),
    health: Health({ health: 100 }),
    debug: Debug(),
    npc: NPC({
      behavior: (e: Entity<Position>) => {
        const { x, y } = e.components.position.data.velocity
        e.components.position.data.rotation += 0.001 * Math.sqrt((x * x) + (y * y))
      }
    }),
    renderable: Renderable({
      zIndex: 3,
      scale: 1,
      scaleMode: "nearest",
      cullable: true,
      setup: async (r: Renderable) => {

        const texture = (await loadTexture("retro.json"))["rock"]
        const sprite = new Sprite(texture)

        sprite.anchor.set(0.5, 0.6)

        r.c = sprite
      }
    })
  }
})
