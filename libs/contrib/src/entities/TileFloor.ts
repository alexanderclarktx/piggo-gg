import { Entity } from "@piggo-legends/core";
import { Position, Tile, Renderable } from "@piggo-legends/contrib";
import { Assets, Texture, Resource } from "pixi.js";

let index = 0;

export type TileFloorProps = {
  rows: number,
  cols: number,
  position?: { x: number, y: number },
  id?: string,
}

export const TileFloor = async ({ rows, cols, position = { x: 0, y: 0 }, id = `floor${index += 1}` }: TileFloorProps): Promise<Entity> => {

  const makeTiles = async () => {
    const sandbox = await Assets.load("sandbox.json");
    const texture = sandbox.textures["white"] as Texture<Resource>;

    let tiles: Tile[] = [];
    for (let x = 0; x < rows; x++) {
      for (let y = 0; y < cols; y++) {
        tiles.push(new Tile({
          position: { x: y * texture.width - (x * texture.width), y: (y + x) * (texture.height - 4) },
          texture,
          tint: 0x8888ff,
          zIndex: 0,
          id: `tile-${x}-${y}`,
        }));
      }
    }
    return tiles;
  }

  return {
    id: id,
    components: {
      position: new Position(position),
      renderable: new Renderable({
        debuggable: false,
        zIndex: 0,
        children: makeTiles
      })
    }
  }
}

// TODO this is not efficient (run from single system)
// const cull = (c: Container, r: Tile, g: Game) => {
//   if (g.tick % 3 !== 0) return;

//   if (Math.abs(centeredXY.x - r.c.x) > 700 || Math.abs(centeredXY.y - r.c.y) > 400) {
//     r.c.visible = false;
//   } else {
//     r.c.visible = true;
//   }
// }
