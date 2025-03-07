import {
  ClientSystemBuilder, Collider, Debug, Entity, LineWall, loadTexture,
  Networked, NPC, pixiGraphics, Position, Renderable, Shadow, timeToLand, XY
} from "@piggo-gg/core"
import { Sprite } from "pixi.js"

export const Net = () => LineWall({
  position: { x: 225, y: -75 },
  points: [
    0, 0,
    0, 150
  ],
  visible: true,
  sensor: () => {
    return false
  }
})

export const Court = () => LineWall({
  position: { x: 0, y: -75 },
  points: [
    0, 0,
    450, 0,
    500, 150,
    -50, 150,
    0, 0
  ],
  visible: true,
  fill: 0x0066aa
})

export const Ball = () => Entity({
  id: "ball",
  components: {
    debug: Debug(),
    position: Position({ x: 225, y: 0, gravity: 0.05 }),
    collider: Collider({ shape: "ball", radius: 4, restitution: 1, group: "11111111111111100000000000000001" }),
    shadow: Shadow(3),
    networked: Networked(),
    npc: NPC({
      behavior: (ball) => {
        const { x, y } = ball.components.position.data.velocity
        ball.components.position.data.rotation += 0.003 * Math.sqrt((x * x) + (y * y))

        if (ball.components.position.data.standing) {
          // ball.decelerate(0.1)
        }
      }
    }),
    renderable: Renderable({
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.7,
      zIndex: 4,
      interpolate: true,
      scaleMode: "nearest",
      rotates: true,
      setup: async (r) => {
        const texture = (await loadTexture("ball.json"))["ball"]
        const sprite = new Sprite(texture)

        sprite.anchor.set(0.5, 0.5)

        r.c = sprite
      }
    })
  }
})

export const BallTarget = (ball: Entity<Position | Renderable>) => {

  let last: XY = { x: 0, y: 0 }

  const ballTarget = Entity<Renderable | Position>({
    id: "BallTarget",
    components: {
      position: Position(),
      renderable: Renderable({
        zIndex: 3.8,
        visible: true,
        dynamic: ({ world }) => {
          const { z, x, y, velocity: v, gravity, standing } = ball.components.position.data

          ballTarget.components.renderable.visible = !standing

          if (v.x === last.x && v.y === last.y) return
          last = { x: v.x, y: v.y }

          const t = timeToLand(gravity, z, v.z)

          ballTarget.components.position.data.x = x + v.x * t / 1000 * world.tickrate
          ballTarget.components.position.data.y = y + v.y * t / 1000 * world.tickrate
        },
        setContainer: async () => {
          const g = pixiGraphics()
          g.ellipse(0, 0, 6, 3)
          g.stroke({ color: 0xff2200, alpha: 0.7, width: 2 })

          return g
        }
      })
    }
  })
  return ballTarget
}

export const BallTargetSystem = ClientSystemBuilder({
  id: "BallTargetSystem",
  init: ((world) => {

    let ballTarget: Entity<Renderable> | undefined = undefined

    return {
      id: "BallTargetSystem",
      query: [],
      priority: 5,
      onTick: () => {
        if (!ballTarget && world.entities["ball"]) {
          ballTarget = BallTarget(world.entities["ball"] as Entity<Position | Renderable>)
          world.addEntity(ballTarget)
        }
      }
    }
  })
})
