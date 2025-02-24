import { Actions, Character, Collider, Entity, GameBuilder, Input, loadTexture, Move, Networked, Player, Point, Position, Renderable, SpawnSystem } from "@piggo-gg/core"
import { AnimatedSprite } from "pixi.js"

// 2d volleyball game (2v2)
export const Volley: GameBuilder = {
  id: "volley",
  init: () => ({
    id: "volley",
    systems: [SpawnSystem(Mouse)],
    bgColor: 0x006633,
    entities: []
  })
}

// the players are mice
export const Mouse = (player: Player) => {
  const mouse: Character = Entity({
    id: `mouse-${player.id}`,
    components: {
      position: Position({ x: 32, y: 100, velocityResets: 1, speed: 120 }),
      networked: Networked(),
      collider: Collider({ shape: "ball", radius: 8, hittable: true }),
      team: player.components.team,
      input: Input({
        press: {
          "a": () => ({ actionId: "move", params: { x: 120 } }),
          "d": () => ({ actionId: "move", params: { x: -120 } }),
        }
      }),
      actions: Actions<any>({
        move: Move,
        point: Point
      }),
      renderable: Renderable({
        scale: 2,
        zIndex: 3,
        interpolate: true,
        scaleMode: "nearest",
        setup: async (r) => {
          const t = await loadTexture("chars.json")

          r.animations = {
            l: new AnimatedSprite([t["l1"], t["l2"], t["l3"]]),
            r: new AnimatedSprite([t["r1"], t["r2"], t["r3"]])
          }
        }
      })
    }
  })
  return mouse
}
