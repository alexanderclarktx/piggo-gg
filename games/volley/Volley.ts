import {
  Action, Actions, Background, CameraSystem, Character, Collider, Cursor, Debug,
  EscapeMenu, GameBuilder, Input, loadTexture, mouse, Move, Networked, Player, Point,
  Position, Renderable, Shadow, ShadowSystem, SpawnSystem, velocityToPoint, WASDInputMap, XYZdiff
} from "@piggo-gg/core"
import { BallTargetSystem, Court, Net, Ball } from "./entities"
import { AnimatedSprite } from "pixi.js"

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
      Net()
    ]
  })
}

const Slap = Action("hit", ({ entity, world }) => {
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

    if (position.data.standing) {
      ballPosition.setVelocity({ z: 4 })
      ballPosition.data.gravity = 0.1

      const { x, y } = mouse
      const v = velocityToPoint(ballPosition.data, { x, y }, 0.1, 4)

      ballPosition.setVelocity({ x: v.x / 25 * 1000, y: v.y / 25 * 1000 })
    } else {
      ballPosition.setVelocity({ z: 0 })
      ballPosition.data.gravity = 0.1

      const { x, y } = mouse
      const v = velocityToPoint(ballPosition.data, { x, y }, 0.1, 0)

      ballPosition.setVelocity({ x: v.x / 25 * 1000, y: v.y / 25 * 1000 })
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
          return { actionId: "slap" }
        }
      }
    }),
    actions: Actions({
      move: Move,
      jump: Action("jump", ({ entity }) => {
        if (!entity?.components?.position?.data.standing) return
        entity.components.position.setVelocity({ z: 6 })
      }),
      slap: Slap,
      point: Point
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
