import {
  Actions, Clickable, Collider, Debug, Entity, Input, Networked, Position,
  Renderable, VehicleMovement, XY, controlEntity, loadTexture, random, randomInt
} from "@piggo-gg/core"
import { AnimatedSprite } from "pixi.js"

export type SpaceshipProps = {
  id?: string
  position?: XY
}

export const Spaceship = ({ id, position }: SpaceshipProps = {}) => Entity({
  id: id ?? `spaceship${randomInt(1000)}`,
  components: {
    position: Position(position ?? { x: random() * 600, y: random() * 600 }),
    networked: Networked(),
    actions: Actions({
      ...VehicleMovement,
      click: controlEntity
    }),
    clickable: Clickable({ width: 100, height: 120 }),
    collider: Collider({ shape: "ball", radius: 20 }),
    input: Input({
      press: {
        "a,d": () => null, "w,s": () => null,
        "shift,a": ({ world }) => ({ actionId: "skidleft", playerId: world.client?.playerId() }),
        "shift,d": ({ world }) => ({ actionId: "skidright", playerId: world.client?.playerId() }),
        "w": ({ world }) => ({ actionId: "up", playerId: world.client?.playerId() }),
        "s": ({ world }) => ({ actionId: "down", playerId: world.client?.playerId() }),
        "a": ({ world }) => ({ actionId: "left", playerId: world.client?.playerId() }),
        "d": ({ world }) => ({ actionId: "right", playerId: world.client?.playerId() })
      }
    }),
    debug: Debug(),
    renderable: Renderable({
      rotates: true,
      zIndex: 3,
      setup: async (r: Renderable) => {
        const texture = (await loadTexture("spaceship.json"))["spaceship"]
        const sprite = new AnimatedSprite([texture])
        sprite.scale = { x: 2, y: 2 }
        sprite.anchor.set(0.5, 0.5)
        r.c = sprite
      }
    })
  }
})
