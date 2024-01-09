import { Entity } from "@piggo-legends/core";
import { Position, Networked, Clickable, Actions, Character, playerControlsEntity, Controller, CharacterMovementScreenPixels, CharacterMovementCommands, Renderable, Health, Collider } from "@piggo-legends/contrib";
import { Assets, AnimatedSprite, SCALE_MODES, Container, Graphics } from "pixi.js";

export const Skelly = async (id: string, tint?: number): Promise<Entity> => {

  const render = async () => {
    const textures = (await Assets.load("chars.json")).textures;

    const character = new Character({
      animations: {
        d: new AnimatedSprite([textures["d1"], textures["d2"], textures["d3"]]),
        u: new AnimatedSprite([textures["u1"], textures["u2"], textures["u3"]]),
        l: new AnimatedSprite([textures["l1"], textures["l2"], textures["l3"]]),
        r: new AnimatedSprite([textures["r1"], textures["r2"], textures["r3"]]),
        dl: new AnimatedSprite([textures["dl1"], textures["dl2"], textures["dl3"]]),
        dr: new AnimatedSprite([textures["dr1"], textures["dr2"], textures["dr3"]]),
        ul: new AnimatedSprite([textures["ul1"], textures["ul2"], textures["ul3"]]),
        ur: new AnimatedSprite([textures["ur1"], textures["ur2"], textures["ur3"]])
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

  return {
    id: id,
    components: {
      position: new Position({ x: 300, y: 300 }),
      networked: new Networked({ isNetworked: true }),
      health: new Health(100, 100),
      clickable: new Clickable({
        width: 32,
        height: 32,
        active: true,
        onPress: "click"
      }),
      collider: new Collider({ x: 15, y: 15 }),
      controller: new Controller<CharacterMovementCommands>({
        "a,d": "", "w,s": "",
        "w,a": "upleft", "w,d": "upright", "s,a": "downleft", "s,d": "downright",
        "w": "up", "s": "down", "a": "left", "d": "right"
      }),
      actions: new Actions({
        ...CharacterMovementScreenPixels,
        "click": playerControlsEntity
      }),
      renderable: new Renderable({
        debuggable: true,
        zIndex: 1,
        children: async () => [ await render() ]
      })
    }
  }
}
