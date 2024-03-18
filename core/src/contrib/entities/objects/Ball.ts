import { Collider, Debug, Entity, NPC, Networked, Position, Renderable } from "@piggo-gg/core";
import { Sprite } from "pixi.js";

export type BallProps = {
  id?: string
  position?: { x: number, y: number }
}

export const Ball = ({ position, id }: BallProps = { position: { x: 50, y: 50 } }) => Entity({
  id: id ?? `ball${Math.trunc(Math.random() * 100)}`,
  components: {
    position: new Position(position),
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

        const texture = (await r.loadTextures("ball.json"))["ball"];
        const sprite = new Sprite(texture);

        sprite.anchor.set(0.5, 0.5);

        r.c = sprite;
      }
    })
  }
});
