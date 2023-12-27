import { Entity, Renderer } from "@piggo-legends/core";
import { Position, Networked, Clickable, Actions, Character, playerControlsEntity, Controller, CharacterMovementScreenPixels, CharacterMovementCommands } from "@piggo-legends/contrib";
import { Assets, AnimatedSprite, SCALE_MODES, Container, Graphics } from "pixi.js";

export const Skelly = async (id: string, renderer?: Renderer, tint?: number): Promise<Entity> => {
  const skellyAssets = renderer ? await Assets.load("chars.json") : null;

  const renderable = renderer ? makeRenderable(renderer, skellyAssets, tint) : undefined;

  return {
    id: id,
    components: {
      position: new Position({ x: 300, y: 300 }),
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
        ...CharacterMovementScreenPixels,
        "click": playerControlsEntity
      }),
      ...renderable ? { renderable } : {}
    }
  }
}

const makeRenderable = (renderer: Renderer, skellyAssets: any, tint?: number) => {
  const character = new Character({
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
    scale: 2,
    zIndex: 2,
    tintColor: tint ?? 0xffffff,
    scaleMode: SCALE_MODES.NEAREST
  });

  const swordContainer = new Container();

  // Hilt
  const hilt = new Graphics();
  hilt.beginFill(0x8B4513);
  hilt.drawRect(0, 0, 20, 30);
  hilt.endFill();

  // Crossguard
  const crossguard = new Graphics();
  crossguard.beginFill(0xC0C0C0);
  crossguard.drawRect(-15, 0, 50, 10);
  crossguard.endFill();

  // Blade
  const blade = new Graphics();
  blade.beginFill(0xa0f0C0);
  blade.lineTo(0, -50);
  blade.bezierCurveTo(10, -60, 10, -60, 20, -50);
  blade.lineTo(20, -50);
  blade.lineTo(20, 0);
  blade.lineTo(0, 0);
  blade.closePath();
  blade.endFill();

  // Add the hilt, crossguard, and blade to the sword container
  swordContainer.addChild(hilt, crossguard, blade);
  swordContainer.position.set(18, -5);
  swordContainer.scale.set(0.3);

  character.c.addChild(swordContainer);

  return character;
}
