import { Entity, Game, Renderer } from "@piggo-legends/core";
import { Position, Tile, Renderable, centeredXY } from "@piggo-legends/contrib";
import { Assets, Texture, Resource, Container } from "pixi.js";

let index = 0;

// todo this is not efficient (run from single system)
const cull = (c: Container, r: Tile, g: Game) => {
  if (g.tick % 3 !== 0) return;

  if (Math.abs(centeredXY.x - r.c.x) > 700 || Math.abs(centeredXY.y - r.c.y) > 400) {
    r.c.visible = false;
  } else {
    r.c.visible = true;
  }
}

export type TileFloorProps = {
  renderer: Renderer,
  rows: number,
  cols: number,
  position?: { x: number, y: number },
  id?: string,
}

export const TileFloor = async ({ renderer, rows, cols, position = { x: 0, y: 0 }, id = `floor${index += 1}` }: TileFloorProps): Promise<Entity> => {

  let texture: Texture<Resource> | undefined = undefined;

  if (!texture) {
    // const sandbox = await Assets.load("c_tiles.json");
    // texture = sandbox.textures["grass"] as Texture<Resource>;

    const sandbox = await Assets.load("sandbox.json");
    texture = sandbox.textures["white"] as Texture<Resource>;
    // texture.baseTexture.scaleMode = 0;
  }

  let tiles: Tile[] = [];
  for (let x = 0; x < rows; x++) {
    for (let y = 0; y < cols; y++) {
      tiles.push(new Tile({
        // dynamic: cull,
        position: { x: y * texture.width - (x * texture.width), y: (y + x) * (texture.height - 4) },
        renderer,
        texture,
        tint: 0x8888ff,
        zIndex: 0,
        // visible: false,s
        id: `tile-${x}-${y}`,
      }));
    }
  }

  return {
    id: id,
    components: {
      position: new Position(position),
      renderable: new Renderable({
        renderer,
        debuggable: true,
        zIndex: 0,
        children: tiles
      })
    }
  }
}
