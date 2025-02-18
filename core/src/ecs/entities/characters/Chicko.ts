import {
  Actions, Chase, Collider, Debug, Food, Element, Entity, Health, InvokedAction,
  NPC, Networked, Position, PositionProps, Renderable, World, XY,
  closestEntity, loadTexture, random, randomInt, round, XYdelta, Eat
} from "@piggo-gg/core"
import { AnimatedSprite } from "pixi.js"

export type ChickoProps = {
  id?: string
  positionProps?: PositionProps
}

export const Chicko = ({ id, positionProps = { x: randomInt(500), y: randomInt(500) } }: ChickoProps = {}) => {
  const chicko = Entity<Health | Actions | Position | Renderable>({
    id: id ?? `chicko-${randomInt(1000)}`,
    components: {
      position: Position({ ...positionProps, velocityResets: 1, speed: positionProps.speed ?? 50 }),
      networked: Networked(),
      health: Health({ hp: 75 }),
      npc: NPC({ behavior }),
      actions: Actions({
        "chase": Chase,
        "eat": Eat
      }),
      element: Element("flesh"),
      collider: Collider({ shape: "ball", radius: 8, mass: 300, hittable: true }),
      debug: Debug(),
      renderable: Renderable({
        scale: 1.5,
        zIndex: 3,
        interpolate: true,
        color: 0xffffff,
        scaleMode: "nearest",
        anchor: { x: 0.5, y: 0.7 },
        dynamic: ({ renderable }) => {
          const { orientationRads } = chicko.components.position

          const x = (orientationRads > 2 && orientationRads < 6) ? 1 : -1
          renderable.setScale({ x, y: 1 })
        },
        setup: async (r: Renderable) => {
          const t = await loadTexture("chicko.json")
          r.animations = {
            d: new AnimatedSprite([t["2"], t["1"], t["3"]])
          }
        }
      })
    }
  })
  return chicko
}

const behavior = (entity: Entity<Position>, world: World): void | InvokedAction => {
  const { position, renderable } = entity.components

  const edibles = world.queryEntities(["food", "position"])
    .filter((e) => !(e.id.includes("chicko")))
    .filter(e => (e.components.item?.equipped || e.components.item?.dropped)) as Entity<Food | Position>[]

  const closest = closestEntity(edibles, position.data, 200)

  if (closest) {
    if (XYdelta(position.data, closest.components.position.data) < 20 + (0.5 * renderable!.scale * renderable!.scale)) {
      return { actionId: "eat", params: { target: closest } }
    }
    return { actionId: "chase", params: { target: closest } }
  }

  if (!position.data.heading.x && !position.data.heading.y) {

    if (random() * 100 > 96) {
      const randomHeading: XY = {
        x: position.data.x + round(random() * 200 - 100),
        y: position.data.y + round(random() * 200 - 100)
      }

      position.setHeading(randomHeading)
    }
  }

  if (position.lastCollided - world.tick > -2) position.clearHeading()
}
