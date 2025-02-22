import {
  Apple, Collider, Debug, Element, Entity, Health, NPC,
  Networked, Position, Renderable, XY, loadTexture, randomInt
} from "@piggo-gg/core"
import { Sprite } from "pixi.js"

export type TreeProps = {
  id?: string
  position?: XY
}

export const Tree = ({ position, id }: TreeProps = {}) => {
  const tree = Entity<Renderable | Position>({
    id: id ?? `tree-${randomInt(1000)}`,
    components: {
      position: Position(position ?? { x: randomInt(1000, 500), y: randomInt(1000, 500) }),
      networked: Networked(),
      collider: Collider({
        shape: "ball",
        isStatic: true,
        radius: 11,
        hittable: true
      }),
      element: Element("wood"),
      health: Health({
        hp: 100,
        onDamage: (damage, world) => {
          if (damage > 20 && world.random.int(10) < 9) world.addEntity(
            Apple({
              id: `apple-${world.random.int(1000)}`,
              position: {
                x: tree.components.position.data.x + world.random.int(10, 5),
                y: tree.components.position.data.y + world.random.int(10, 5)
              }
            })
          )
        }
      }),
      debug: Debug(),
      npc: NPC({
        behavior: (e: Entity<Position>) => {
          const { x, y } = e.components.position.data.velocity
          e.components.position.data.rotation += 0.001 * Math.sqrt((x * x) + (y * y))
        }
      }),
      renderable: Renderable({
        zIndex: 3,
        scale: 3,
        scaleMode: "nearest",
        cullable: true,
        setup: async (r: Renderable) => {

          const texture = (await loadTexture("c_tiles.json"))["tree"]
          const sprite = new Sprite(texture)

          sprite.anchor.set(0.5, 0.6)

          r.c = sprite
        }
      })
    }
  })
  return tree
}
