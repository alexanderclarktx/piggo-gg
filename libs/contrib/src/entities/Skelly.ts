import { Entity, Renderer } from "@piggo-legends/core";
import { Position, Networked, Clickable, Actions, Character, playerControlsEntity, Controller, CharacterMovement, CharacterMovementCommands } from "@piggo-legends/contrib";
import { Assets, AnimatedSprite } from "pixi.js";

export const Skelly = async (renderer: Renderer, id: string, tint?: number): Promise<Entity> => {
  const skellyAssets = await Assets.load("chars.json");
  return {
    id: id,
    components: {
      position: new Position(300, 300),
      networked: new Networked({ isNetworked: true }),
      clickable: new Clickable({
        width: 32,
        height: 32,
        active: true,
        onPress: "click"
      }),
      controller: new Controller<CharacterMovementCommands>({
        "a,d": "", "w,s": "",
        "w,a": "upleft", "w,d": "upright", "s,a": "downleft", "s,d": "downright",
        "w": "up", "s": "down", "a": "left", "d": "right"
      }),
      actions: new Actions({
        ...CharacterMovement,
        "click": playerControlsEntity
      }),
      renderable: new Character({
        renderer: renderer,
        animations: {
          d: new AnimatedSprite([skellyAssets.textures["d1"], skellyAssets.textures["d2"], skellyAssets.textures["d3"]]),
          u: new AnimatedSprite([skellyAssets.textures["u1"], skellyAssets.textures["u2"], skellyAssets.textures["u3"]]),
          l: new AnimatedSprite([skellyAssets.textures["l1"], skellyAssets.textures["l2"], skellyAssets.textures["l3"]]),
          r: new AnimatedSprite([skellyAssets.textures["r1"], skellyAssets.textures["r2"], skellyAssets.textures["r3"]]),
          dl: new AnimatedSprite([skellyAssets.textures["dl1"], skellyAssets.textures["dl2"], skellyAssets.textures["dl3"]]),
          dr: new AnimatedSprite([skellyAssets.textures["dr1"], skellyAssets.textures["dr2"], skellyAssets.textures["dr3"]]),
          ul: new AnimatedSprite([skellyAssets.textures["ul1"], skellyAssets.textures["ul2"], skellyAssets.textures["ul3"]]),
          ur: new AnimatedSprite([skellyAssets.textures["ur1"], skellyAssets.textures["ur2"], skellyAssets.textures["ur3"]])
        },
        track: true,
        scale: 2,
        zIndex: 2,
        tintColor: tint ?? 0xffffff
      })
    }
  }
}
