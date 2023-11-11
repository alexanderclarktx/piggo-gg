import { Component, Entity, Renderer } from "@piggo-legends/core";
import { Floor, Position } from "@piggo-legends/contrib";
import { Assets } from "pixi.js";

export const TileFloor = async (
  renderer: Renderer,
  id: string = "tileFloor",
  components?: Record<string, Component<string>>
): Promise<Entity> => {
  const sandbox = await Assets.load("sandbox.json");

  return new Entity({
    id: id,
    components: {
      ...components,
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
  })
}