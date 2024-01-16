import { Clickable, Collider, Debug, Networked, Position, Renderable } from "@piggo-legends/contrib";
import { Entity } from "@piggo-legends/core";
import { Bodies } from "matter-js";
import { HTMLText } from "pixi.js";

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
      active: true,
      onPress: "click"
    }),
    collider: new Collider({ radius: 6 }),
    debug: new Debug(),
    renderable: new Renderable({
      zIndex: 2,
      container: async () => {
        const text = new HTMLText("⚽️", { fill: "#FFFFFF", fontSize: 18 })
        text.anchor.set(0.5);
        return text;
      }
    })
  }
});
