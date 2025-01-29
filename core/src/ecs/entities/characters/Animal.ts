import {
  Actions, Character, Collider, Debug, Effects, Element, Entity, Health, Input,
  JumpPlatform, loadTexture, Move, Networked, Noob, Point, Position, Renderable, XY
} from "@piggo-gg/core"
import { AnimatedSprite } from "pixi.js"

export const Animal = (player: Noob, color?: number, pos?: XY) => {
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
