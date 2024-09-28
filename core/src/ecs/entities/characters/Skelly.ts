import {
  Actions, Axe, Boost, Character, Collider, Debug,
  DefaultJoystickHandler, Effects, Entity, Head, Health,
  IceWall, Input, Inventory, Move, Networked, Noob, Pickaxe, Point, Position,
  Renderable, WASDInputMap, XY, loadTexture, setActiveItemIndex
} from "@piggo-gg/core"
import { AnimatedSprite } from "pixi.js"

export const Skelly = (player: Noob, color?: number, pos?: XY) => {
  const skelly: Character = Entity({
    id: `skelly-${player.id}`,
    components: {
      debug: Debug(),
      position: Position({ x: pos?.x ?? 32, y: pos?.y ?? 400, velocityResets: 1, speed: 120 }),
      networked: Networked({ isNetworked: true }),
      collider: Collider({ shape: "ball", radius: 8, mass: 600, shootable: true }),
      health: Health({ health: 100 }),
      team: player.components.team,
      inventory: Inventory([Axe, Pickaxe]),
      input: Input({
        press: {
          ...WASDInputMap.press,
          "mb2": ({ mouse }) => ({ action: "head", params: { mouse } }),
          "q": ({ mouse }) => ({ action: "wall", params: mouse }),
          "e": ({ mouse }) => ({ action: "boost", params: mouse }),
          "1": () => ({ action: "setActiveItemIndex", params: { index: 0 } }),
          "2": () => ({ action: "setActiveItemIndex", params: { index: 1 } }),
          "3": () => ({ action: "setActiveItemIndex", params: { index: 2 } }),
          "4": () => ({ action: "setActiveItemIndex", params: { index: 3 } }),
          "5": () => ({ action: "setActiveItemIndex", params: { index: 4 } }),
          "6": () => ({ action: "setActiveItemIndex", params: { index: 5 } }),
          "7": () => ({ action: "setActiveItemIndex", params: { index: 6 } }),
          "8": () => ({ action: "setActiveItemIndex", params: { index: 7 } })
        },
        joystick: DefaultJoystickHandler
      }),
      actions: Actions({
        "boost": Boost,
        "head": Head,
        "move": Move,
        "wall": IceWall,
        "point": Point,
        "setActiveItemIndex": setActiveItemIndex
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
          const textures = await loadTexture("chars.json")

          r.animations = {
            d: new AnimatedSprite([textures["d1"], textures["d2"], textures["d3"]]),
            u: new AnimatedSprite([textures["u1"], textures["u2"], textures["u3"]]),
            l: new AnimatedSprite([textures["l1"], textures["l2"], textures["l3"]]),
            r: new AnimatedSprite([textures["r1"], textures["r2"], textures["r3"]]),
            dl: new AnimatedSprite([textures["dl1"], textures["dl2"], textures["dl3"]]),
            dr: new AnimatedSprite([textures["dr1"], textures["dr2"], textures["dr3"]]),
            ul: new AnimatedSprite([textures["ul1"], textures["ul2"], textures["ul3"]]),
            ur: new AnimatedSprite([textures["ur1"], textures["ur2"], textures["ur3"]])
          }
        }
      })
    }
  })
  return skelly
}
