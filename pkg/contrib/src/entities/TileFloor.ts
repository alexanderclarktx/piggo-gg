import { Entity, Renderer } from "@piggo-legends/core";
import { Floor, Position } from "@piggo-legends/contrib";
import { Assets } from "pixi.js";

export const TileFloor = async (renderer: Renderer, id: string = "tileFloor"): Promise<Entity> => {
  const sandbox = await Assets.load("sandbox.json");
  return {
    id: id,
    networked: false,
    components: {
      position: new Position(0, 0),
      renderable: new Floor({
        renderer: renderer,
        width: 25,
        height: 25,
        texture: sandbox.textures["green"],
        scale: 2,
        tint: 0x1199ff,
        zIndex: 0
      })
    }
  }
}
