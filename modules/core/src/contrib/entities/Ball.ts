import { Clickable, Collider, Debug, Networked, Position, Renderable } from "@piggo-legends/core";
import { Entity } from "@piggo-legends/core";
import { Text } from "pixi.js";

export type BallProps = {
  id?: string,
  position?: { x: number, y: number }
}

export const Ball = ({ position, id }: BallProps = {}): Entity => ({
  id: id ?? `ball${Math.trunc(Math.random() * 100)}`,
  components: {
    position: new Position(position ?? { x: 100 + Math.random() * 600, y: 100 + Math.random() * 600 }),
    networked: new Networked({ isNetworked: true }),
    clickable: new Clickable({
      width: 32,
      height: 32,
      active: true
    }),
    collider: new Collider({ radius: 7, frictionAir: 0.01 }),
    debug: new Debug(),
    renderable: new Renderable({
      zIndex: 2,
      dynamic: (t: Text, _, e: Entity<Position>) => {
        console.log(e);
        const v = e.components.position.data;
        t.rotation += 0.1 * Math.sqrt(v.velocityX * v.velocityY + v.velocityY * v.velocityY);
      },
      container: async () => {
        const text = new Text("⚽️", { fill: "#FFFFFF", fontSize: 18 })
        text.anchor.set(0.43, 0.44);
        return text;
      }
    })
  }
});
