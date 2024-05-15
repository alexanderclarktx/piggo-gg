import { Actions, Collider, Input, Debug, Entity, Gun, Health, Networked, Pistol, Position, Renderable, Shoot, WASDActionMap, WASDInput, loadTexture, pixiText } from "@piggo-gg/core";
import { AnimatedSprite } from "pixi.js";

export const Skelly = (id: string, color?: number) => {
  const skelly = Entity<Position | Gun>({
    id: id,
    components: {
      debug: new Debug(),
      position: new Position({ x: 32, y: 400, velocityResets: 1, speed: 130 }),
      networked: new Networked({ isNetworked: true }),
      collider: new Collider({ shape: "ball", radius: 8, mass: 600 }),
      health: new Health({ health: 200, maxHealth: 200 }),
      gun: Pistol(),
      input: new Input({
        keyboard: {
          ...WASDInput.keyboard,
          "mb1": ({ mouse, world }) => ({ action: "shoot", playerId: world.client?.playerId, params: { mouse, id: Math.round(Math.random() * 10000) } }),
        },
        joystick: WASDInput.joystick
      }),
      actions: new Actions<{}>({
        ...WASDActionMap,
        ...Shoot
      }),
      renderable: new Renderable({
        anchor: { x: 0.5, y: 0.7 },
        scale: 2,
        zIndex: 3,
        scaleMode: "nearest",
        animationColor: color ?? 0xffffff,
        setup: async (r) => {
          const textures = await loadTexture("chars.json");

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

          // TODO refactor should be added by a separate system
          const nametag = pixiText({
            text: id.split("-")[1],
            style: { fill: 0xffff00, fontSize: 13 },
            anchor: { x: 0.48, y: 0 },
            pos: { x: 0, y: -46 }
          });

          r.c.addChild(nametag);
        }
      })
    }
  });
  return skelly;
}
