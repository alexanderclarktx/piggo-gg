import { Entity, Renderer, Position, Renderable } from "@piggo-legends/core";
import { Assets, Texture, Resource, Matrix, Sprite, RenderTexture } from "pixi.js";

let index = 0;

export type TileFloorProps = {
  rows: number
  cols: number
  position?: { x: number, y: number }
  id?: string
}

export const TileFloor = async ({ rows, cols, position = { x: 0, y: 0 }, id = `floor${index++}` }: TileFloorProps): Promise<Entity> => {

  const makeTiles = async (r: Renderer) => {
    const sandbox = await Assets.load("sandbox.json");
    const texture = sandbox.textures["white"] as Texture<Resource>;

    // create the initial tile sprite
    const tile = new Sprite(texture);
    tile.position.set(0, 0);
    tile.anchor.set(0.5, 0.5);
    tile.scale.set(2);
    tile.eventMode = "static";
    tile.tint = 0x7777aa;

    // create a render texture
    const renderTexture = RenderTexture.create({
      width: tile.width,
      height: tile.height,
      resolution: window.devicePixelRatio
    });

    // render the tile to the render texture
    r.app.renderer.render(tile, {
      renderTexture,
      transform: new Matrix(1, 0, 0, 1, tile.width / 2, tile.height / 2)
    });

    let tiles: Renderable[] = [];
    for (let x = 0; x < rows; x++) {
      for (let y = 0; y < cols; y++) {
        tiles.push(new Renderable({
          position: new Position({ x: y * texture.width - (x * texture.width), y: (y + x) * (texture.height - 4) }),
          container: async () => new Sprite(renderTexture),
          visible: x < 25 ? (y < 25 ? true : false) : false
        }))
      }
    }
    return tiles;
  }

  return {
    id: id,
    components: {
      position: new Position(position),
      renderable: new Renderable({
        zIndex: 0,
        children: makeTiles
      })
    }
  }
}
