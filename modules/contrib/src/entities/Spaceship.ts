import { Entity } from "@piggo-legends/core";
import { Position, Networked, Clickable, Actions, Character, CarMovement, playerControlsEntity, Controller, CarMovementCommands, Velocity, Renderable } from "@piggo-legends/contrib";
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
      velocity: new Velocity(),
      networked: new Networked({ isNetworked: true }),
      clickable: new Clickable({
        width: 100,
        height: 120,
        active: true,
        onPress: "click"
      }),
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
        debuggable: true,
        zIndex: 2,
        children: async () => [ await render() ]
      })
    }
  }
}
