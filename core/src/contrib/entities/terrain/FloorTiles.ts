import { Entity, Position, Renderable, Renderer, XY } from "@piggo-gg/core";
import { Assets, Matrix, RenderTexture, Sprite, Texture } from "pixi.js";

let index = 0;

export type FloorTilesProps = {
  rows: number
  cols: number
  position?: XY
  id?: string
  tint?: number
}

export const FloorTilesPoints = (rows: number, cols: number, x: number, y: number) => [
  32 + x, 0 + y,
  (cols * 32 + 32) + x, (cols * 16) + y,
  ((cols - rows) * 32 + 32) + x, ((cols + rows) * 16) + y,
  (-rows * 32 + 32) + x, (rows * 16) + y,
  32 + x, 0 + y
]

export const FloorTiles = ({ tint, rows, cols, position = { x: 0, y: 0 }, id = `floor${index++}` }: FloorTilesProps): Entity => Entity({
  id: id,
  components: {
    position: new Position(position),
    renderable: new Renderable({
      zIndex: 0 + index * 0.01,
      setChildren: async (r: Renderer) => {
        const sandbox = await Assets.load("sandbox.json");
        const texture = sandbox.textures["white"] as Texture;

        // create the initial tile sprite
        const tile = new Sprite(texture);
        tile.position.set(0, 0);
        tile.anchor.set(0.5, 0.5);
        tile.scale.set(2);
        tile.eventMode = "static";
        tile.tint = tint ?? 0x7777aa;

        // create a render texture
        const renderTexture = RenderTexture.create({
          width: tile.width,
          height: tile.height,
          resolution: window.devicePixelRatio
        });

        // render the tile to the render texture
        r.app.renderer.render({
          container: tile,
          target: renderTexture,
          transform: new Matrix(2, 0, 0, 2, tile.width / 2, tile.height / 2)
        });

        let tiles: Renderable[] = [];
        for (let x = 0; x < rows; x++) {
          for (let y = 0; y < cols; y++) {
            tiles.push(new Renderable({
              position: { x: y * texture.width - (x * texture.width), y: (y + x) * (texture.height - 4) },
              setContainer: async () => new Sprite(renderTexture)
            }))
          }
        }
        return tiles;
      }
    })
  }
});
