import { Entity } from "@piggo-legends/core";
import { Position, Networked, Clickable, Actions, Character, CarMovement, playerControlsEntity, Controller, CarMovementCommands, Renderable, Collider } from "@piggo-legends/contrib";
import { Assets, AnimatedSprite } from "pixi.js";

export type SpaceshipProps = {
  id?: string,
  position?: {x: number, y: number}
}

export const Spaceship = async ({ id, position }: SpaceshipProps = {}): Promise<Entity> => {

  const render = async () => {
    const texture = (await Assets.load("spaceship.json")).textures["spaceship"];
    const sprite = new AnimatedSprite([texture])

    return new Character({
      animations: {
        d: sprite, u: sprite, l: sprite, r: sprite,
        dl: sprite, dr: sprite, ul: sprite, ur: sprite,
      },
      scale: 2,
      zIndex: 3
    })
  };

  return {
    id: id ?? `spaceship${Math.trunc(Math.random() * 100)}`,
    components: {
      position: new Position(position ?? { x: Math.random() * 600, y: Math.random() * 600 }),
      networked: new Networked({ isNetworked: true }),
      clickable: new Clickable({
        width: 100,
        height: 120,
        active: true,
        onPress: "click"
      }),
      collider: new Collider({ x: 15, y: 15 }),
      controller: new Controller<CarMovementCommands>({
        "a,d": "", "w,s": "",
        "shift,a": "skidleft", "shift,d": "skidright",
        "w": "up", "s": "down", "a": "left", "d": "right"
      }),
      actions: new Actions({
        ...CarMovement,
        "click": playerControlsEntity
      }),
      renderable: new Renderable({
        rotates: true,
        debuggable: true,
        zIndex: 2,
        children: async () => [ await render() ]
      })
    }
  }
}
