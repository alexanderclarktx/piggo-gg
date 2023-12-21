import { Entity, Renderer } from "@piggo-legends/core";
import { Position, Tile, Renderable, centeredXY } from "@piggo-legends/contrib";
import { Assets, Texture, Resource, Container } from "pixi.js";

// sets visible=false if Renderable is out of bounds
const cull = (_: Container, r: Tile) => {
  if (Math.abs(centeredXY.x - r.c.x) > 700 || Math.abs(centeredXY.y - r.c.y) > 400) {
    r.c.visible = false;
  } else {
    r.c.visible = true;
  }
}

let texture: Texture<Resource> | undefined = undefined;

export const Floor = async (renderer: Renderer, rows: number, cols: number, id: string = "floor"): Promise<Entity> => {

  if (!texture) {
    // const sandbox = await Assets.load("c_tiles.json");
    // texture = sandbox.textures["grass"] as Texture<Resource>;

    const sandbox = await Assets.load("sandbox.json");
    texture = sandbox.textures["white"] as Texture<Resource>;
  }

  let tiles: Tile[] = [];
  for (let x = 0; x < rows; x++) {
    for (let y = 0; y < cols; y++) {
      tiles.push(new Tile({
        dynamic: cull,
        position: { x: y * texture.width - (x * texture.width), y: (y + x) * (texture.height - 4) },
        renderer,
        texture,
        tint: 0x8888ff,
        zIndex: 0,
        visible: false
      }));
    }
  }

  return {
    id: id,
    components: {
      position: new Position({}),
      renderable: new Renderable({
        renderer,
        debuggable: false,
        texture,
        zIndex: 0,
        children: tiles,
      })
    }
  }
}
