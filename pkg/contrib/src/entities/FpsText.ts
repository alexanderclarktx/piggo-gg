import { Component, Entity, Renderer } from "@piggo-legends/core";
import { Position, TextBox } from "@piggo-legends/contrib";
import { Text } from "pixi.js";

export const FpsText = (
  renderer: Renderer,
  id: string = "fpsText",
  components?: Record<string, Component<string>>
): Entity => {
  return new Entity({
    id: id,
    components: {
      ...components,
      position: new Position(0, 0),
      renderable: new TextBox({
        renderer: renderer,
        cameraPos: { x: -35, y: 5 },
        color: 0xFFFF00,
        zIndex: 1,
        dynamic: (t: Text) => {
          t.text = Math.round(renderer.app.ticker.FPS);
        },
      })
    }
  })
}
