import { Collider, Debug, Entity, NPC, Networked, Position, Renderable, XY, loadTexture } from "@piggo-gg/core";
import { Sprite } from "pixi.js";

export type BallProps = {
  id: string
  position?: XY
}

export const Ball = ({ position, id }: BallProps) => Entity({
  id: id,
  components: {
    position: Position(position ?? { x: 50, y: 250 }),
    networked: Networked({ isNetworked: true }),
    collider: Collider({
      shape: "ball",
      radius: 7,
      frictionAir: 0.4,
      mass: 20,
      restitution: 0.9
    }),
    debug: Debug(),
    npc: NPC({
      npcOnTick: (e: Entity<Position>) => {
        const { x, y } = e.components.position.data.velocity;
        e.components.position.data.rotation += 0.001 * Math.sqrt((x * x) + (y * y));
      }
    }),
    renderable: Renderable({
      zIndex: 3,
      rotates: true,
      interpolate: true,
      setup: async (r: Renderable) => {

        const texture = (await loadTexture("ball.json"))["ball"];
        const sprite = new Sprite(texture);

        sprite.anchor.set(0.5, 0.5);

        r.c = sprite;
      }
    })
  }
});
