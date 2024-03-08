import { Entity, Position, Renderable } from "@piggo-gg/core";
import { Sprite, TilingSprite } from "pixi.js"

export const SpaceBackground = (): Entity => ({
  id: "background",
  components: {
    position: new Position({ x: -4000, y: -2000 }),
    renderable: new Renderable({
      zIndex: -2,
      setup: async (container) => {
        const image = Sprite.from("space.png");
        const tiles = new TilingSprite(image.texture, 6000, 6000);
        container.c.addChild(tiles)
      }
    })
  }
});
