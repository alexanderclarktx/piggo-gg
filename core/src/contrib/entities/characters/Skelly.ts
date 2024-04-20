import { Action, Actions, Collider, Controlled, Controller, Debug, Entity, Gun, Networked, Pistol, Position, Projectile, Renderable, WASDActionMap, WASDController, norm } from "@piggo-gg/core";
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
        "shoot": Action<{ mouse: { x: number, y: number } }>(({ world, params }) => {
          if (world.clientPlayerId && skelly.components.gun.canShoot()) {
            skelly.components.gun.shoot();

            const { x, y } = skelly.components.position.data;
            const { speed } = skelly.components.gun;

            // distance to mouse
            let dx = params.mouse.x - x;
            let dy = params.mouse.y - y;

            // normalize
            const hyp = Math.sqrt(dx * dx + dy * dy);
            let vx = dx / hyp * speed;
            let vy = dy / hyp * speed;

            // spawn bullet at offset
            const offset = 30;
            const Xoffset = offset * (vx / Math.sqrt(vx * vx + vy * vy));
            const Yoffset = offset * (vy / Math.sqrt(vx * vx + vy * vy));

            const pos = { x: x + Xoffset , y: y + Yoffset, vx, vy };
            world.addEntity(Projectile({ radius: 4, pos }), 2000);
          }
        })
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
