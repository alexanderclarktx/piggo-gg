import { Entity, Renderer } from "@piggo-legends/core";
import { Position, Tile, Renderable } from "@piggo-legends/contrib";
import { Assets, Texture, Resource } from "pixi.js";

export const FloorTile = async (renderer: Renderer, position: { x: number, y: number }, id: string = "floorTile"): Promise<Entity> => {
  const sandbox = await Assets.load("sandbox.json");
  const texture = sandbox.textures["white"] as Texture<Resource>;

  return {
    id: `${id}-x${position.x}y${position.y}`,
    components: {
      position: new Position(position.x * texture.width, position.y * (texture.height - 4) * 2),
      renderable: new Tile({
        renderer,
        debuggable: false,
        tint: 0x8888ff,
        texture,
        zIndex: 0
      })
    }
  }
}

// deprecated. not a good way to do this
export const Floor = async (renderer: Renderer, rows: number, cols: number, id: string = "floor"): Promise<Entity> => {
  const sandbox = await Assets.load("sandbox.json");
  const texture = sandbox.textures["white"] as Texture<Resource>;

  let children: Tile[] = [];
  for (let x = 0; x < rows; x++) {
    for (let y = 0; y < cols; y++) {
      children.push(new Tile({
        position: { x: y * texture.width - (x * texture.width), y: (y + x) * (texture.height - 4) },
        renderer,
        texture,
        tint: 0x8888ff,
        zIndex: 0
      }));
    }
  }

  return {
    id: id,
    components: {
      position: new Position(0, 0),
      renderable: new Renderable({
        renderer,
        debuggable: true,
        texture,
        zIndex: 0,
        children
      })
    }
  }
}
