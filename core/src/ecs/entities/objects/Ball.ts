import { Collider, Debug, Entity, NPC, Networked, Position, Renderable, XY, loadTexture } from "@piggo-gg/core";
import { Sprite } from "pixi.js";

export type BallProps = {
  id: string
  position?: XY
}

export const Ball = ({ position, id }: BallProps) => Entity({
  id: id,
  components: {
    position: new Position(position ?? { x: 50, y: 250 }),
    networked: new Networked({ isNetworked: true }),
    collider: new Collider({
      shape: "ball",
      radius: 7,
      frictionAir: 0.4,
      mass: 20,
      restitution: 0.9
    }),
    debug: new Debug(),
    npc: new NPC({
      onTick: (e: Entity<Position>) => {
        const { vx, vy } = e.components.position.data;
        e.components.position.data.rotation += 0.001 * Math.sqrt((vx * vx) + (vy * vy));
      }
    }),
    renderable: new Renderable({
      zIndex: 3,
      rotates: true,
      setup: async (r: Renderable) => {

        const texture = (await loadTexture("ball.json"))["ball"];
        const sprite = new Sprite(texture);

        sprite.anchor.set(0.5, 0.5);

        r.c = sprite;
      }
    })
  }
});