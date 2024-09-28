import { Collider, Debug, Entity, Health, NPC, Networked, Position, Renderable, XY, loadTexture, randomInt } from "@piggo-gg/core"
import { ColorMatrixFilter, Sprite } from "pixi.js"

export type TreeProps = {
  id?: string
  position?: XY
}

export const Tree = ({ position, id }: TreeProps = {}) => {
  const filter = new ColorMatrixFilter()
  let brightness = 1

  const tree = Entity<Renderable>({
    id: id ?? `tree-${randomInt(1000)}`,
    components: {
      position: Position(position ?? { x: randomInt(500), y: randomInt(500) }),
      networked: Networked({ isNetworked: true }),
      collider: Collider({
        shape: "ball",
        isStatic: true,
        radius: 11,
        shootable: true
      }),
      health: Health({
        health: 100,
        onDamage: (damage) => {
          brightness = 1 + (damage / 25)
        }
      }),
      debug: Debug(),
      npc: NPC({
        npcOnTick: (e: Entity<Position>) => {
          const { x, y } = e.components.position.data.velocity
          e.components.position.data.rotation += 0.001 * Math.sqrt((x * x) + (y * y))
        }
      }),
      renderable: Renderable({
        zIndex: 3,
        scale: 3,
        scaleMode: "nearest",
        cullable: true,
        dynamic: () => {
          if (brightness > 1) brightness -= 0.1
          filter.brightness(brightness, false)
        },
        setup: async (r: Renderable) => {

          const texture = (await loadTexture("c_tiles.json"))["tree"]
          const sprite = new Sprite(texture)

          sprite.anchor.set(0.5, 0.6)

          r.c = sprite
          r.c.filters = [filter]
        }
      })
    }
  })
  return tree
}
