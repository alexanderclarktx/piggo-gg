import { Actions, Clickable, Collider, Controller, Debug, Entity, Networked, Position, Renderable, VehicleMovement, VehicleMovementCommands, playerControlsEntity } from "@piggo-legends/core";
import { AnimatedSprite } from "pixi.js";

export type SpaceshipProps = {
  id?: string,
  position?: {x: number, y: number}
}

export const Spaceship = async ({ id, position }: SpaceshipProps = {}): Promise<Entity> => {

  return {
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
      collider: new Collider({ radius: 60 }),
      controller: new Controller<VehicleMovementCommands>({
        "a,d": null, "w,s": null,
        "shift,a": "skidleft", "shift,d": "skidright",
        "w": "up", "s": "down", "a": "left", "d": "right"
      }),
      debug: new Debug(),
      actions: new Actions(VehicleMovement),
      renderable: new Renderable({
        rotates: true,
        scale: 2,
        zIndex: 3,
        setup: async (r: Renderable) => {
          const texture = (await r.loadTextures("spaceship.json"))["spaceship"];
          const sprite = new AnimatedSprite([texture])

          r.animations = {
            d: sprite, u: sprite, l: sprite, r: sprite,
            dl: sprite, dr: sprite, ul: sprite, ur: sprite,
          }
        }
      })
    }
  }
}
