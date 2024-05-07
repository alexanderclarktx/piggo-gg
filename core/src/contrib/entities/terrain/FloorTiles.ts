import { Entity, Renderer, Position, Renderable, Debug } from "@piggo-gg/core";
import { Assets, Texture, Sprite, RenderTexture, Matrix, Graphics } from "pixi.js";

let index = 0;

export type FloorTilesProps = {
  rows: number
  cols: number
  position?: { x: number, y: number }
  id?: string
  tint?: number
}

export const FloorTiles = ({ tint, rows, cols, position = { x: 0, y: 0 }, id = `floor${index++}` }: FloorTilesProps): Entity => {

  const makeTiles = async (r: Renderer) => {
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

  return Entity({
    id: id,
    components: {
      position: new Position(position),
      renderable: new Renderable({
        zIndex: 0 + index * 0.01,
        setChildren: makeTiles
      })
    }
  });
}
