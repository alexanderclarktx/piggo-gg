import { Renderable, Position } from "@piggo-legends/contrib";
import { Entity, Renderer } from "@piggo-legends/core";
import { TilingSprite, Assets } from "pixi.js";

export const TilingSpriteFloor = async (renderer: Renderer, rows: number, cols: number): Promise<Entity> => {
    // tiling sprite 1
    const tilingSprite = new TilingSprite((await Assets.load("sandbox.json")).textures["white_small"], 32 * rows, 16 * cols);
    tilingSprite.scale.set(2);
    tilingSprite.tint = 0x8888ff;

    // tiling sprite 2
    const tilingSprite2 = new TilingSprite((await Assets.load("sandbox.json")).textures["white_small"], 32 * rows, 16 * cols);
    tilingSprite2.position.set(16, 8);
    tilingSprite2.tint = 0x8888ff;
    tilingSprite.addChild(tilingSprite2);

  return {
    id: "abc",
    components: {
      position: new Position({ x: -10000, y: -5000 }),
      renderable: new Renderable({
        renderer: renderer,
        container: tilingSprite
      })
    }
  }
}
