import { Actions, Collider, Controlled, Controller, Debug, Entity, Gun, Networked, Pistol, Position, Renderable, Shoot, WASDActionMap, WASDController } from "@piggo-gg/core";
import { AnimatedSprite, Text } from "pixi.js";

export const Skelly = (id: string, tint?: number) => {
  const skelly = Entity<Position | Gun>({
    id: id,
    components: {
      debug: new Debug(),
      position: new Position({ x: 151, y: 300, velocityResets: 1 }),
      networked: new Networked({ isNetworked: true }),
      controlled: new Controlled({ entityId: "" }),
      collider: new Collider({ shape: "ball", radius: 8, mass: 600 }),
      gun: Pistol,
      controller: new Controller(WASDController),
      actions: new Actions({
        ...WASDActionMap,
        ...Shoot
      }),
      renderable: new Renderable({
        anchor: { x: 0.5, y: 0.7 },
        scale: 2,
        zIndex: 3,
        scaleMode: "nearest",
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

          r.bufferedAnimation = "d";

          const nametag = new Text({
            text: id.split("-")[1],
            style: { fill: 0xffff00, fontSize: 14 }
          }).updateTransform({ x: -20, y: -45 });

          r.c.addChild(nametag);
        }
      })
    }
  });
  return skelly;
}
