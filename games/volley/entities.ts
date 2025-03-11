import {
  abs, Action, Actions, Character, Chase, ClientSystemBuilder, closestEntity, Collider,
  Debug, Entity, Input, LineWall, loadTexture, Move, Networked, NPC, pixiGraphics, Player,
  Point, Position, Renderable, Shadow, sign, sqrt, Team, TeamColors, TeamNumber,
  timeToLand, velocityToDirection, velocityToPoint, WASDInputMap, XY, XYdistance, XYZdiff
} from "@piggo-gg/core"
import { AnimatedSprite, Sprite } from "pixi.js"
import { VolleyballState } from "./Volleyball"

export const Spike = Action<{ target: XY }>("spike", ({ entity, world, params }) => {
  const { position } = entity?.components ?? {}
  if (!position) return

  const ball = world.entity<Position>("ball")
  if (!ball) return

  if (!params.target) return

  const { position: ballPos } = ball.components

  const range = position.data.standing ? 20 : 30
  const far = XYZdiff(position.data, ballPos.data, range)

  if (!far) {
    world.client?.soundManager.play("spike")

    const state = world.game.state as VolleyballState
    if (state.phase === "serve") {
      ballPos.setVelocity({ z: 3 })
      ballPos.data.gravity = 0.07
      return
    }

    if (position.data.standing) {
      ballPos.setVelocity({ z: 3.5 })
      ballPos.data.gravity = 0.07

      const v = velocityToDirection(ballPos.data, params.target, 70, 0.07, 3.5)
      console.log(`velocityToDirection x: ${v.x}, y: ${v.y}`)
      ballPos.setVelocity({ x: v.x / 25 * 1000, y: v.y / 25 * 100 })
    } else {
      const distance = XYdistance(position.data, params.target)
      const z = 5 + distance / 80

      ballPos.setVelocity({ z })
      ballPos.data.gravity = 0.1

      const v = velocityToPoint(ballPos.data, params.target, 0.1, z)
      console.log(`velocityToPoint x: ${v.x}, y: ${v.y}`)
      ballPos.setVelocity({ x: v.x / 25 * 1000, y: v.y / 25 * 1000 })
    }
  }
}, 20)

export const Bot = (team: TeamNumber, pos: XY) => Entity({
  id: `bot-${team}-${pos.x}-${pos.y}`,
  components: {
    debug: Debug(),
    position: Position({ ...pos, velocityResets: 1, speed: 120, gravity: 0.3 }),
    networked: Networked(),
    collider: Collider({ shape: "ball", radius: 4, group: "11111111111111100000000000000001" }),
    team: Team(team),
    actions: Actions({
      move: Move,
      spike: Spike,
      chase: Chase,
      jump: Action("jump", ({ entity }) => {
        if (!entity?.components?.position?.data.standing) return
        entity.components.position.setVelocity({ z: 6 })
      })
    }),
    shadow: Shadow(5),
    npc: NPC({
      behavior: (entity, world) => {
        const ball = world.entity<Position>("ball")
        if (!ball) return

        const { position: ballPos } = ball.components
        const { position } = entity.components

        const range = position.data.standing ? 20 : 30
        const far = XYZdiff(position.data, ballPos.data, range)

        if (!far) {
          // todo filter on team
          const closestPlayer = closestEntity(
            world.queryEntities<Position>(["position", "team"])
              .filter(e => e.id.includes("dude")),
            ballPos.data
          )

          const target = closestPlayer ? closestPlayer.components.position.data : { x: 0, y: 0 }

          return { actionId: "spike", entityId: entity.id, params: { target } }
        } else {
          const target = world.entity<Position>("target")
          if (!target) return
          return { actionId: "chase", entityId: entity.id, params: { target } }
        }
      },
    }),
    renderable: Renderable({
      anchor: { x: 0.5, y: 0.8 },
      scale: 2,
      zIndex: 4,
      interpolate: true,
      scaleMode: "nearest",
      color: TeamColors[team],
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
        "mb1": ({ hold, mouse }) => {
          if (hold) return null
          return { actionId: "spike", params: { target: mouse } }
        }
      }
    }),
    actions: Actions({
      move: Move,
      spike: Spike,
      point: Point,
      jump: Action("jump", ({ entity }) => {
        if (!entity?.components?.position?.data.standing) return
        entity.components.position.setVelocity({ z: 6 })
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
    collider: Collider({ shape: "ball", radius: 4, restitution: 0.8, group: "11111111111111100000000000000000" }),
    shadow: Shadow(3, 3),
    networked: Networked(),
    npc: NPC({
      behavior: (ball) => {
        const { x, y, z } = ball.components.position.data.velocity
        ball.components.position.data.rotation += 0.01 * sqrt(abs((x + y + z))) * sign(x)
      }
    }),
    renderable: Renderable({
      anchor: { x: 0.5, y: 0.5 },
      scale: 0.6,
      // scale: 0.22,
      zIndex: 4,
      interpolate: true,
      scaleMode: "nearest",
      rotates: true,
      // outline: { color: 0x222222, thickness: 1 },
      setup: async (r) => {
        // const texture = (await loadTexture("piggo-logo.json"))["piggo-logo"]
        const texture = (await loadTexture("vball.json"))["ball"]
        r.c = new Sprite(texture)
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
          g.stroke({ color: 0x55ff00, alpha: 0.8, width: 1.5 })

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
  visible: true
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
