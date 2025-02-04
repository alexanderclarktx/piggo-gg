import {
  Actions, Background, Character, Collider, Debug, DefaultUI, Effects, Element, Entity, GameBuilder, Health, Input,
  JumpPlatform, LineWall, loadTexture, Move, Networked, Player, Point, Position, Renderable, SpawnSystem, XY
} from "@piggo-gg/core"
import { AnimatedSprite } from "pixi.js"

export const Animals: GameBuilder = {
  id: "animals",
  init: (world) => ({
    id: "animals",
    systems: [SpawnSystem(Animal)],
    view: "side",
    entities: [
      ...DefaultUI(world),
      Background({ img: "stars.png" }),

      Platform(-250, 50),
      Platform(-300, 150),
      Platform(-400, 100),
      Platform(-100, 50),
      Platform(0, 0),
      Platform(100, -50),
      Platform(200, -100),
      Platform(300, -150),

      Floor()
    ]
  })
}

const Floor = () => LineWall({ points: [-1000, 200, 10000, 200], visible: true })

const Platform = (x: number, y: number) => {
  return LineWall({
    position: { x, y },
    points: [0, 0, 0, 20, 100, 20, 100, 0, 0, 0],
    visible: true
  })
}

export const Animal = (player: Player, color?: number, pos?: XY) => {
  const animal: Character = Entity({
    id: `animal-${player.id}`,
    components: {
      debug: Debug(),
      position: Position({ x: pos?.x ?? 32, y: pos?.y ?? 100, gravity: 15, friction: 10 }),
      networked: Networked(),
      collider: Collider({ shape: "ball", radius: 8, mass: 600, hittable: true }),
      health: Health({ health: 100 }),
      team: player.components.team,
      element: Element("flesh"),
      input: Input({
        press: {
          "a,d": () => null,
          "a": () => ({ actionId: "move", params: { x: -100 } }),
          "d": () => ({ actionId: "move", params: { x: 100 } }),
          "g": () => ({ actionId: "dropItem" }),  
          "1": () => ({ actionId: "setActiveItemIndex", params: { index: 0 } }),
          "2": () => ({ actionId: "setActiveItemIndex", params: { index: 1 } }),
          "3": () => ({ actionId: "setActiveItemIndex", params: { index: 2 } }),
          "4": () => ({ actionId: "setActiveItemIndex", params: { index: 3 } }),
          "5": () => ({ actionId: "setActiveItemIndex", params: { index: 4 } }),
          " ": ({ hold }) => ({ actionId: "jump", params: { hold } }),
        }
      }),
      actions: Actions<any>({
        move: Move,
        jump: JumpPlatform,
        point: Point
      }),
      effects: Effects(),
      renderable: Renderable({
        anchor: { x: 0.5, y: 0.75 },
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
  return animal
}
