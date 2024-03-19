import { Actions, Clickable, Collider, Controller, Debug, Entity, Networked, Position, Renderable, VehicleMovement, VehicleMovementActions, playerControlsEntity } from "@piggo-gg/core";
import { AnimatedSprite } from "pixi.js";

export type SpaceshipProps = {
  id?: string
  position?: { x: number, y: number }
}

export const Spaceship = ({ id, position }: SpaceshipProps = {}) => Entity({
  id: id ?? `spaceship${Math.trunc(Math.random() * 100)}`,
  components: {
    position: new Position(position ?? { x: Math.random() * 600, y: Math.random() * 600 }),
    networked: new Networked({ isNetworked: true }),
    clickable: new Clickable({
      width: 100,
      height: 120,
      active: true,
      click: playerControlsEntity
    }),
    collider: new Collider({ shape: "cuboid", radius: 60 }),
    controller: new Controller<VehicleMovementActions>({
      "a,d": null, "w,s": null,
      "shift,a": "skidleft", "shift,d": "skidright",
      "w": "up", "s": "down", "a": "left", "d": "right"
    }),
    debug: new Debug(),
    actions: new Actions(VehicleMovement),
    renderable: new Renderable({
      rotates: true,
      zIndex: 3,
      setup: async (r: Renderable) => {
        const texture = (await r.loadTextures("spaceship.json"))["spaceship"];
        const sprite = new AnimatedSprite([texture]);
        sprite.scale = { x: 2, y: 2 };
        r.c = sprite;
      }
    })
  }
});
