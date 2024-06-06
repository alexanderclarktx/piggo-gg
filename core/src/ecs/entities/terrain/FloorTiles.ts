import { Entity, Position, Renderable, Renderer, XY } from "@piggo-gg/core";
import { Graphics, Matrix, RenderTexture, Sprite } from "pixi.js";

export type FloorTilesProps = {
  rows: number
  cols: number
  position?: XY
  id?: string
  tint?: number
  color?: number
}

let index = 0;

export const FloorTiles = ({ color, tint, rows, cols, position = { x: 0, y: 0 }, id = `floor${index++}` }: FloorTilesProps): Entity => Entity({
  id: id,
  components: {
    position: new Position(position),
    renderable: new Renderable({
      zIndex: 0 + index * 0.01,
      setChildren: async (r: Renderer) => {

        // draw the square
        const width = 64;
        const height = 32;
        const square = new Graphics()
          .transform(new Matrix(1, 0, 0, 1, 0, 16))
          .poly([0, 0, width / 2, height / 2, width, 0, width / 2, -height / 2])
          .fill({ color: color ?? 0x7777aa, alpha: 1 })
          .stroke({ width: 1, color: 0x000000 });

        // create a render texture
        const renderTexture = RenderTexture.create({ width, height, resolution: window.devicePixelRatio });
        r.app.renderer.render({ container: square, target: renderTexture });

        // create the tiles
        let tiles: Renderable[] = [];
        for (let x = 0; x < rows; x++) {
          for (let y = 0; y < cols; y++) {
            tiles.push(new Renderable({
              position: { x: y * width / 2 - (x * width / 2), y: (y + x) * height / 2 },
              color: tint ?? 0xffffff,
              setContainer: async () => new Sprite(renderTexture)
            }))
          }
        }
        return tiles;
      }
    })
  }
});
