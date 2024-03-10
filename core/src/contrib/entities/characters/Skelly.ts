import { Actions, Clickable, Collider, Controlled, Controller, Debug, Entity, Health, Networked, Position, Renderable, WASDMovementActions, WASDMovementPhysics, playerControlsEntity } from "@piggo-gg/core";
import { AnimatedSprite, Text, SCALE_MODES } from "pixi.js";

export const Skelly = (id: string, tint?: number) => Entity({
  id: id,
  components: {
    position: new Position({ x: 300, y: 300, velocityResets: 1 }),
    networked: new Networked({ isNetworked: true }),
    health: new Health(100, 100),
    clickable: new Clickable({
      width: 32,
      height: 32,
      active: true,
      click: playerControlsEntity
    }),
    controlled: new Controlled({ entityId: "" }),
    collider: new Collider({ shape: "ball", radius: 8, mass: 600 }),
    controller: new Controller<WASDMovementActions>({
      "a,d": null, "w,s": null,
      "w,a": "upleft", "w,d": "upright", "s,a": "downleft", "s,d": "downright",
      "w": "up", "s": "down", "a": "left", "d": "right"
    }),
    debug: new Debug(),
    actions: new Actions(WASDMovementPhysics),
    renderable: new Renderable({
      anchor: { x: 0.5, y: 0.7 },
      scale: 2,
      zIndex: 3,
      scaleMode: SCALE_MODES.NEAREST,
      setup: async (r: Renderable) => {
        const textures = await r.loadTextures("chars.json");

        r.animations = {
          d: new AnimatedSprite([textures["d1"], textures["d2"], textures["d3"]]),
          u: new AnimatedSprite([textures["u1"], textures["u2"], textures["u3"]]),
          l: new AnimatedSprite([textures["l1"], textures["l2"], textures["l3"]]),
          r: new AnimatedSprite([textures["r1"], textures["r2"], textures["r3"]]),
          dl: new AnimatedSprite([textures["dl1"], textures["dl2"], textures["dl3"]]),
          dr: new AnimatedSprite([textures["dr1"], textures["dr2"], textures["dr3"]]),
          ul: new AnimatedSprite([textures["ul1"], textures["ul2"], textures["ul3"]]),
          ur: new AnimatedSprite([textures["ur1"], textures["ur2"], textures["ur3"]])
        }

        r.setAnimationColor(0xffffff);
        r.bufferedAnimation = "d";

        const nametag = new Text();
        nametag.text = id.split("-")[1]
        nametag.style = { fill: 0xffff00, fontSize: 13 }
        nametag.setTransform(-20, -45);

        r.c.addChild(nametag);
      }
    })
  }
});
