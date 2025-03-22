import {
  Entity, Networked, NPC, pixiGraphics, Position, Renderable, SystemBuilder, timeToLand, XY
} from "@piggo-gg/core"
import { BevelFilter } from "pixi-filters"

const Target = (ball: Entity<Position | Renderable>) => {

  let last: XY = { x: 0, y: 0 }

  const target = Entity<Renderable | Position>({
    id: "target",
    components: {
      position: Position(),
      networked: Networked(),
      npc: NPC({
        behavior: (_, world) => {
          const { z, x, y, velocity: v, gravity, standing } = ball.components.position.data

          if (v.x === last.x && v.y === last.y) return
          last = { x: v.x, y: v.y }

          const t = timeToLand(gravity, z, v.z)

          target.components.position.setPosition({
            x: x + v.x * t / 1000 * world.tickrate,
            y: y + v.y * t / 1000 * world.tickrate
          })

          target.components.renderable.visible = (!standing && gravity > 0)
        }
      }),
      renderable: Renderable({
        filters: [new BevelFilter({ rotation: 135, thickness: 1 })],
        zIndex: 3.8,
        visible: false,
        setContainer: async () => {
          const g = pixiGraphics()
          g.ellipse(0, 0, 6, 3)
          g.stroke({ color: 0x00ffff, alpha: 1, width: 1.5 })

          return g
        }
      })
    }
  })
  return target
}

export const TargetSystem = SystemBuilder({
  id: "TargetSystem",
  init: ((world) => {

    let target: Entity<Renderable> | undefined = undefined

    return {
      id: "BallTargetSystem",
      query: [],
      priority: 5,
      onTick: () => {
        const ball = world.entity<Position | Renderable>("ball")

        if (ball) {
          if (!target || !world.entity("target")) {
            target = Target(ball)
            world.addEntity(target)
          }
        }
      }
    }
  })
})
