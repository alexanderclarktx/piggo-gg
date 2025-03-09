import {
  Action, Actions, Background, CameraSystem, Character, Collider, Cursor, Debug,
  EscapeMenu, GameBuilder, Input, loadTexture, mouse, Move, Networked, Player, Point,
  Position, Renderable, Shadow, ShadowSystem, SpawnSystem, SystemBuilder, velocityToDirection, velocityToPoint, WASDInputMap, XYZdiff
} from "@piggo-gg/core"
import { TargetSystem, Court, Net, Ball } from "./entities"
import { AnimatedSprite } from "pixi.js"

export const Volleyball: GameBuilder = {
  id: "volleyball",
  init: () => ({
    id: "volleyball",
    netcode: "rollback",
    systems: [
      SpawnSystem(Dude),
      VolleyballSystem,
      ShadowSystem,
      TargetSystem,
      CameraSystem({ follow: () => ({ x: 225, y: 0 }) })
    ],
    bgColor: 0x006633,
    entities: [
      Background({ img: "space.png" }),
      EscapeMenu(), Cursor(),
      Ball(),
      Court(),
      Net()
    ]
  })
}

const VolleyballSystem = SystemBuilder({
  id: "VolleyballSystem",
  init: (world) => {
    return {
      id: "VolleyballSystem",
      query: [],
      priority: 5,
      onTick: () => {
        const ball = world.entity<Position>("ball")
        if (!ball) return

        const { x, y, z, velocity } = ball.components.position.data

        if (x < -100 || x > 600) {
          ball.components.position.setPosition({ x: 225, y: 0 }).setVelocity({ x: 0, y: 0 })
          // ball.components.position.data.velocity.x = -velocity.x
        }
      }
    }
  }
})

const Spike = Action("spike", ({ entity, world }) => {
  const { position } = entity?.components ?? {}
  if (!position) return

  const ball = world.entity<Position>("ball")
  if (!ball) return

  const { position: ballPos } = ball.components

  const range = position.data.standing ? 15 : 30
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
