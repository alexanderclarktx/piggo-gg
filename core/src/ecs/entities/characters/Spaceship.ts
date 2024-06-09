import { Actions, Clickable, Collider, Input, Debug, Entity, Networked, Position, Renderable, VehicleMovement, VehicleMovementActions, controlEntity, loadTexture, XY } from "@piggo-gg/core";
import { AnimatedSprite } from "pixi.js";

export type SpaceshipProps = {
  id?: string
  position?: XY
}

export const Spaceship = ({ id, position }: SpaceshipProps = {}) => Entity({
  id: id ?? `spaceship${Math.trunc(Math.random() * 100)}`,
  components: {
    position: Position(position ?? { x: Math.random() * 600, y: Math.random() * 600 }),
    networked: Networked({ isNetworked: true }),
    actions: Actions({
      ...VehicleMovement,
      click: controlEntity
    }),
    clickable: Clickable({ width: 100, height: 120, active: true }),
    collider: Collider({ shape: "ball", radius: 20 }),
    input: Input({
      press: {
        "a,d": () => null, "w,s": () => null,
        "shift,a": ({ world }) => ({ action: "skidleft", playerId: world.client?.playerId }),
        "shift,d": ({ world }) => ({ action: "skidright", playerId: world.client?.playerId }),
        "w": ({ world }) => ({ action: "up", playerId: world.client?.playerId }),
        "s": ({ world }) => ({ action: "down", playerId: world.client?.playerId }),
        "a": ({ world }) => ({ action: "left", playerId: world.client?.playerId }),
        "d": ({ world }) => ({ action: "right", playerId: world.client?.playerId })
      },
      joystick: () => null
    }),
    debug: Debug(),
    renderable: Renderable({
      rotates: true,
      zIndex: 3,
      setup: async (r: Renderable) => {
        const texture = (await loadTexture("spaceship.json"))["spaceship"];
        const sprite = new AnimatedSprite([texture]);
        sprite.scale = { x: 2, y: 2 };
        sprite.anchor.set(0.5, 0.5);
        r.c = sprite;
      }
    })
  }
});
