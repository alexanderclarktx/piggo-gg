import {
  Action, Actions, Background, CameraSystem, Character, Collider, Debug, Entity,
  GameBuilder, Input, LineWall, loadTexture, min, Move, Networked, Player,
  Point, Position, Renderable, SpawnSystem, SystemBuilder, WASDInputMap
} from "@piggo-gg/core"
import { AnimatedSprite } from "pixi.js"

export const Volley: GameBuilder = {
  id: "volley",
  init: () => ({
    id: "volley",
    systems: [SpawnSystem(Mouse), GravitySystem, CameraSystem({ follow: () => ({ x: 225, y: 0 }) })],
    bgColor: 0x006633,
    entities: [Court(), Net(), Background({ img: "space.png" })]
  })
}

const Mouse = (player: Player) => Character({
  id: `mouse-${player.id}`,
  components: {
    debug: Debug(),
    position: Position({ x: 0, y: 0, velocityResets: 1, speed: 120 }),
    networked: Networked(),
    collider: Collider({ shape: "ball", radius: 8, hittable: true }),
    team: player.components.team,
    input: Input({
      press: {
        ...WASDInputMap.press,
        " ": () => ({ actionId: "jump" })
      }
    }),
    actions: Actions<any>({
      move: Move,
      point: Point,
      jump: Action("jump", ({ entity }) => {
        console.log("jump")
        if (!entity) return

        const { renderable } = entity.components
        if (!renderable) return

        renderable.position.y -= 20
      }, 10)
    }),
    renderable: Renderable({
      anchor: { x: 0.5, y: 0.7 },
      scale: 2,
      zIndex: 3,
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

// court (trapezoid)
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
  fill: 0xE2CA76
})

const GravitySystem = SystemBuilder({
  id: "GravitySystem",
  init: () => ({
    id: "GravitySystem",
    query: ["position", "collider", "renderable"],
    onTick: (entities: Entity<Position | Collider | Renderable>[]) => {
      entities.forEach((entity) => {
        const { renderable } = entity.components

        if (renderable.position.y < 0) {
          renderable.position.y = min(0, renderable.position.y + 1)
        }
      })
    }
  })
})
