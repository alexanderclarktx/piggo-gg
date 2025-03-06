import {
  Action, Actions, Background, CameraSystem, Character, ClientSystemBuilder, Collider, Cursor, Debug,
  Entity, EscapeMenu, GameBuilder, Input, LineWall, loadTexture, Move, Networked, NPC, pixiGraphics,
  Player, Position, Renderable, Shadow, ShadowSystem, SpawnSystem, WASDInputMap, XY, XYZdiff
} from "@piggo-gg/core"
import { AnimatedSprite, Sprite } from "pixi.js"

export const Volley: GameBuilder = {
  id: "volley",
  init: () => ({
    id: "volley",
    netcode: "rollback",
    systems: [SpawnSystem(Dude), ShadowSystem, BallTargetSystem, CameraSystem({ follow: () => ({ x: 225, y: 0 }) })],
    bgColor: 0x006633,
    entities: [
      Background({ img: "space.png" }),
      EscapeMenu(), Cursor(),
      Ball(),
      Court(),
      //Net()
    ]
  })
}

const Dude = (player: Player) => Character({
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
          return { actionId: "hit" }
        }
      }
    }),
    actions: Actions({
      move: Move,
      hit: Action("hit", ({ entity, world }) => {
        const { position } = entity?.components ?? {}
        if (!position) return

        const ball = world.entities["ball"]
        const { position: ballPosition } = ball.components
        if (!ballPosition) return

        const distance = position.data.standing ? 15 : 30

        const far = XYZdiff(position.data, ballPosition.data, distance)

        if (!far) {
          const ball = world.entities["ball"]
          if (!ball) return
          const { position: ballPosition } = ball.components
          if (!ballPosition) return

          ballPosition.setVelocity({ z: 2.5 })
          ballPosition.setVelocity({ x: world.random.int(20, 40), y: world.random.int(20, 40) })
        }
      }, 20),
      jump: Action("jump", ({ entity }) => {
        if (!entity?.components?.position?.data.standing) return
        entity.components.position.setVelocity({ z: 6 })
      }, 0)
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

const Net = () => LineWall({
  position: { x: 225, y: -75 },
  points: [
    0, 0,
    0, 150
  ],
  visible: true
})

const Court = () => LineWall({
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

const Ball = () => Entity({
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

const BallTarget = (ball: Entity<Position | Renderable>) => {

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

          const a = -0.5 * gravity
          const discriminant = v.z * v.z - 4 * a * z
          const t = (-v.z - Math.sqrt(discriminant)) / (2 * a)

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

const BallTargetSystem = ClientSystemBuilder({
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
