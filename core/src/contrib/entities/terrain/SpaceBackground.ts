import { Entity, Position, Renderable } from "@piggo-gg/core";
import { Assets, Sprite, TilingSprite } from "pixi.js"

export const SpaceBackground = () => Entity({
  id: "background",
  components: {
    position: new Position({ x: -8000, y: -2000 }),
    renderable: new Renderable({
      zIndex: -2,
      setup: async (container) => {
        const image = Sprite.from(await Assets.load("space.png"));
        const tiles = new TilingSprite( { texture: image.texture, width: 12000, height: 12000 });
        container.c = tiles;
      }
    })
  }
});
