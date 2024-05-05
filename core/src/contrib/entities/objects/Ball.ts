import { Collider, Debug, Entity, NPC, Networked, Position, Renderable, loadTexture } from "@piggo-gg/core";
import { Sprite } from "pixi.js";

export type BallProps = {
  id: string
  position?: { x: number, y: number }
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
        const { velocityX, velocityY } = e.components.position.data;
        e.components.position.data.rotation += 0.002 * Math.sqrt((velocityX * velocityX) + (velocityY * velocityY));
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
