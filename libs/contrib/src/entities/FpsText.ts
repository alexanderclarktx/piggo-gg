import { Entity, Renderer } from "@piggo-legends/core";
import { Position, TextBox } from "@piggo-legends/contrib";
import { HTMLText } from "pixi.js";

export type FpsTextProps = {
  x?: number,
  y?: number,
  color?: number
}

export const FpsText = (renderer: Renderer, props: FpsTextProps = {}, id: string = "fpsText"): Entity => ({
  id: id,
  components: {
    position: new Position({}),
    renderable: new TextBox({
      renderer: renderer,
      debuggable: false,
      cameraPos: { x: props.x ?? -35, y: props.y ?? 5 },
      color: props.color ?? 0xFFFF00,
      zIndex: 1,
      dynamic: (t: HTMLText) => {
        const fps = Math.round(renderer.app.ticker.FPS);
        const color = fps > 100 ? "#00ff00" : fps > 60 ? "yellow" : "red";
        t.text = `<span style=color:${color}>${Math.round(renderer.app.ticker.FPS)}</span>`;
      },
    })
  }
});
