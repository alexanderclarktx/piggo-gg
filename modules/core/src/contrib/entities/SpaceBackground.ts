import { Entity, Position, Renderable } from "@piggo-legends/core";
import { Sprite, TilingSprite } from "pixi.js"

export const SpaceBackground = (): Entity => {
  const image = Sprite.from("space.png");
  const tiles = new TilingSprite(image.texture, 6000, 6000);

  return {
    id: "background",
    components: {
      position: new Position({ x: -4000, y: -2000 }),
      renderable: new Renderable({
        zIndex: -2,
        container: async () => tiles
      })
    }
  }
}
