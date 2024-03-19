import { Entity, Position, Renderable } from "@piggo-gg/core";
import { Assets, Sprite, Texture, TilingSprite } from "pixi.js"

export type BackgroundProps = {
  img?: string
  json?: { path: string, img: string }
}

export const Background = ({ img = "space.png", json }: BackgroundProps = {}) => Entity({
  id: "background",
  components: {
    position: new Position({ x: -8000, y: -2000 }),
    renderable: new Renderable({
      zIndex: -2,
      setup: async (container) => {

        let texture: Texture;

        // load texture from json or image
        if (json) {
          const assets = await Assets.load(json.path);
          texture = assets.textures[json.img];
        } else {
          texture = Sprite.from(await Assets.load(img)).texture;
        }

        const tiles = new TilingSprite({ texture: texture, width: 12000, height: 12000 });
        container.c = tiles;
      }
    })
  }
});
