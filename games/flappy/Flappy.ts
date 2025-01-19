import {
  Actions, Character, Collider, Debug, DefaultUI, Effects, Element,
  Entity, GameBuilder, Health, Input, Jump, LineWall, loadTexture,
  Networked, Noob, Point, Position, Renderable, SpawnSystem, XY
} from "@piggo-gg/core"
import { AnimatedSprite } from "pixi.js"

export const Flappy: GameBuilder = {
  id: "flappy",
  init: (world) => ({
    id: "flappy",
    bgColor: 0x000000,
    view: "side",
    systems: [SpawnSystem(FlappyCharacter)],
    entities: [
      ...DefaultUI(world),
      Floor(),
      Pipe(1000),
      Pipe(1500),
      Pipe(2000),
      Pipe(500),
      Pipe(100),
    ]
  })
}

const Pipe = (x: number) => LineWall({
  points: [
    x, -200,
    x, -100,
    x + 100, -100,
    x + 100, -200
  ],
  visible: true,
  sensor: (e) => {
    if (e.components.health) {
      e.components.health.data.health = 0
      return true
    }
    return false
  }
})

const Floor = () => LineWall({
  points: [-1000, 200, 10000, 200], sensor:
    ({ components }) => {
      if (components.health) components.health.data.health = 0
      return true
    }
})

export const FlappyCharacter = (player: Noob, color?: number, pos?: XY) => {
  const flappy: Character = Entity({
    id: `flappy-${player.id}`,
    components: {
      debug: Debug(),
      position: Position({ x: pos?.x ?? 32, y: pos?.y ?? 0, velocity: { x: 100, y: 0 }, gravity: 5 }),
      networked: Networked({ isNetworked: true }),
      collider: Collider({ shape: "ball", radius: 8, mass: 600, hittable: true }),
      health: Health({ health: 100 }),
      team: player.components.team,
      element: Element("flesh"),
      input: Input({
        press: {
          " ": (params) => ({ actionId: "jump", params })
        }
      }),
      actions: Actions<any>({
        point: Point,
        jump: Jump
      }),
      effects: Effects(),
      renderable: Renderable({
        anchor: { x: 0.5, y: 0.7 },
        scale: 2,
        zIndex: 3,
        interpolate: true,
        scaleMode: "nearest",
        animationColor: color ?? 0xffffff,
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
  return flappy
}
