import {
  Action, Actions, Character, ClientSystemBuilder, Collider,
  Debug, Entity, Input, LineWall, loadTexture, mouse, Move,
  Networked, NPC, pixiGraphics, Player, Position, Renderable,
  Shadow, timeToLand, velocityToDirection, velocityToPoint,
  WASDInputMap, XY, XYZdiff, Point
} from "@piggo-gg/core"
import { AnimatedSprite, Sprite } from "pixi.js"

export const Spike = Action("spike", ({ entity, world }) => {
  const { position } = entity?.components ?? {}
  if (!position) return

  const ball = world.entity<Position>("ball")
  if (!ball) return

  const { position: ballPos } = ball.components

  const range = position.data.standing ? 20 : 30
  const far = XYZdiff(position.data, ballPos.data, range)

  if (!far) {
    if (position.data.standing) {
      ballPos.setVelocity({ z: 3 })
      ballPos.data.gravity = 0.07

      const v = velocityToDirection(ballPos.data, mouse, 50, 0.07, 3)
      console.log(v)
      ballPos.setVelocity({ x: v.x / 25 * 1000, y: v.y / 25 * 1000 })
    } else {
      ballPos.setVelocity({ z: 0 })
      ballPos.data.gravity = 0.1

      const v = velocityToPoint(ballPos.data, mouse, 0.1, 0)
      console.log(v)
      ballPos.setVelocity({ x: v.x / 25 * 1000, y: v.y / 25 * 1000 })
    }
  }
}, 20)

export const Dude = (player: Player) => Character({
  id: `dude-${player.id}`,
  components: {
    debug: Debug(),
    position: Position({ x: 0, y: 0, velocityResets: 1, speed: 120, gravity: 0.3 }),
    networked: Networked(),
    collider: Collider({ shape: "ball", radius: 4, group: "11111111111111100000000000000001" }),
    team: player.components.team,
    input: Input({
      press: {
        ...WASDInputMap.press,
        " ": () => ({ actionId: "jump" }),
        "mb1": ({ hold }) => {
          if (hold) return null
          return { actionId: "spike" }
        }
      }
    }),
    actions: Actions({
      move: Move,
      spike: Spike,
      point: Point,
      jump: Action("jump", ({ entity }) => {
        if (!entity?.components?.position?.data.standing) return
        entity.components.position.setVelocity({ z: 5.5 })
      })
    }),
    shadow: Shadow(5),
    renderable: Renderable({
      anchor: { x: 0.5, y: 0.8 },
      scale: 2,
      zIndex: 4,
      interpolate: true,
      scaleMode: "nearest",
      setup: async (r) => {
        const t = await loadTexture("chars.json")

        r.animations = {
          d: new AnimatedSprite([t["d1"], t["d2"], t["d3"]]),
          u: new AnimatedSprite([t["u1"], t["u2"], t["u3"]]),
          l: new AnimatedSprite([t["l1"], t["l2"], t["l3"]]),
          r: new AnimatedSprite([t["r1"], t["r2"], t["r3"]]),
          dl: new AnimatedSprite([t["dl1"], t["dl2"], t["dl3"]]),
          dr: new AnimatedSprite([t["dr1"], t["dr2"], t["dr3"]]),
          ul: new AnimatedSprite([t["ul1"], t["ul2"], t["ul3"]]),
          ur: new AnimatedSprite([t["ur1"], t["ur2"], t["ur3"]])
        }
      }
    })
  }
})

export const Ball = () => Entity({
  id: "ball",
  components: {
    debug: Debug(),
    position: Position({ x: 225, y: 0, gravity: 0.05 }),
    collider: Collider({ shape: "ball", radius: 4, restitution: 0.8, group: "11111111111111100000000000000001" }),
    shadow: Shadow(3),
    networked: Networked(),
    npc: NPC({
      behavior: (ball) => {
        const { x, y } = ball.components.position.data.velocity
        ball.components.position.data.rotation += 0.003 * Math.sqrt((x * x) + (y * y))
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

export const Target = (ball: Entity<Position | Renderable>) => {

  let last: XY = { x: 0, y: 0 }

  const target = Entity<Renderable | Position>({
    id: "target",
    components: {
      position: Position(),
      renderable: Renderable({
        zIndex: 3.8,
        visible: true,
        dynamic: ({ world }) => {
          const { z, x, y, velocity: v, gravity, standing } = ball.components.position.data

          target.components.renderable.visible = !standing

          if (v.x === last.x && v.y === last.y) return
          last = { x: v.x, y: v.y }

          const t = timeToLand(gravity, z, v.z)

          target.components.position.data.x = x + v.x * t / 1000 * world.tickrate
          target.components.position.data.y = y + v.y * t / 1000 * world.tickrate
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
  return target
}

export const TargetSystem = ClientSystemBuilder({
  id: "TargetSystem",
  init: ((world) => {

    let target: Entity<Renderable> | undefined = undefined

    return {
      id: "BallTargetSystem",
      query: [],
      priority: 5,
      onTick: () => {
        const ball = world.entity<Position | Renderable>("ball")
        if (!target && ball) {
          target = Target(ball)
          world.addEntity(target)
        }
      }
    }
  })
})

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
