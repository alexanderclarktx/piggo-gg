import { Component, Entity, Renderer } from "@piggo-legends/core";
import { Position, Networked, Clickable, Actions, Character, CarMovement, playerControlsEntity, Controller, CarMovementCommands, Velocity } from "@piggo-legends/contrib";
import { Assets, AnimatedSprite } from "pixi.js";

export const Spaceship = async (
  renderer: Renderer,
  id: string = "spaceship",
  components?: Record<string, Component<string>>
): Promise<Entity> => {
  const spaceship = await Assets.load("spaceship.json");

  return new Entity({
    id: id,
    components: {
      ...components,
      position: new Position(100, 300),
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
      renderable: new Character({
        renderer: renderer,
        animations: {
          d: new AnimatedSprite([spaceship.textures["spaceship"]]),
          u: new AnimatedSprite([spaceship.textures["spaceship"]]),
          l: new AnimatedSprite([spaceship.textures["spaceship"]]),
          r: new AnimatedSprite([spaceship.textures["spaceship"]]),
          dl: new AnimatedSprite([spaceship.textures["spaceship"]]),
          dr: new AnimatedSprite([spaceship.textures["spaceship"]]),
          ul: new AnimatedSprite([spaceship.textures["spaceship"]]),
          ur: new AnimatedSprite([spaceship.textures["spaceship"]])
        },
        track: false,
        scale: 2,
        zIndex: 3
      })
    }
  })
}
