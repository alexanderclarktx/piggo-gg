import { Entity, Renderer } from "@piggo-legends/core";
import { Position, TextBox } from "@piggo-legends/contrib";
import { Text } from "pixi.js";

export type FpsTextProps = {
  x?: number,
  y?: number,
  color?: number
}

export const FpsText = (renderer: Renderer, props: FpsTextProps = {}, id: string = "fpsText"): Entity => ({
  id: id,
  components: {
    position: new Position(0, 0),
    renderable: new TextBox({
      renderer: renderer,
      cameraPos: { x: props.x ?? -35, y: props.y ?? 5 },
      color: props.color ?? 0xFFFF00,
      zIndex: 1,
      dynamic: (t: Text) => {
        t.text = Math.round(renderer.app.ticker.FPS);
      },
    })
  }
});
