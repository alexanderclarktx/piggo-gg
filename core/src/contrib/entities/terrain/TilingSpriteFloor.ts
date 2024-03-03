import { Entity, Position, Renderable } from "@piggo-gg/core";
import { Assets, TilingSprite } from "pixi.js";

export const TilingSpriteFloor = async (rows: number, cols: number): Promise<Entity> => {

  const tiles = async () => {
    // tiling sprite 1
    const tilingSprite = new TilingSprite((await Assets.load("sandbox.json")).textures["white_small"], 32 * rows, 16 * cols);
    tilingSprite.scale.set(2);
    tilingSprite.tint = 0xff8899;

    // tiling sprite 2
    const tilingSprite2 = new TilingSprite((await Assets.load("sandbox.json")).textures["white_small"], 32 * rows, 16 * cols);
    tilingSprite2.position.set(16, 8);
    tilingSprite2.tint = 0xff8899;
    tilingSprite.addChild(tilingSprite2);

    return tilingSprite;
  }

  return {
    id: "tiling-sprite-floor",
    components: {
      position: new Position({ x: -4000, y: -1000 }),
      renderable: new Renderable({
        container: tiles
      })
    }
  }
}
