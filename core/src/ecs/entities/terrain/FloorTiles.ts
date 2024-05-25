import { Entity, Position, Renderable, Renderer, XY } from "@piggo-gg/core";
import { Graphics, Matrix, RenderTexture, Sprite } from "pixi.js";

export type FloorTilesProps = {
  rows: number
  cols: number
  position?: XY
  id?: string
  tint?: number
}

const width = 64;
const height = 32;
let index = 0;

const square = new Graphics()
  .transform(new Matrix(1, 0, 0, 0.5, 0, 0))
  .moveTo(width / 2, 0)
  .lineTo(width, width / 2)
  .lineTo(width / 2, width)
  .lineTo(0, width / 2)
  .lineTo(width / 2, 0)
  .fill({ color: 0x7777aa, alpha: 1 })
  .stroke({ width: 1, color: 0x000000 });

export const FloorTiles = ({ tint, rows, cols, position = { x: 0, y: 0 }, id = `floor${index++}` }: FloorTilesProps): Entity => Entity({
  id: id,
  components: {
    position: new Position(position),
    renderable: new Renderable({
      zIndex: 0 + index * 0.01,
      setChildren: async (r: Renderer) => {

        // create a render texture
        const renderTexture = RenderTexture.create({
          width,
          height,
          resolution: window.devicePixelRatio
        });

        // // render the tile to the render texture
        r.app.renderer.render({ container: square, target: renderTexture });

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
