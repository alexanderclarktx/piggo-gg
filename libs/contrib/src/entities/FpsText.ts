import { Entity, Game, Renderer } from "@piggo-legends/core";
import { Position, TextBox } from "@piggo-legends/contrib";
import { HTMLText } from "pixi.js";

export type FpsTextProps = {
  renderer: Renderer
  x?: number,
  y?: number,
  color?: number
}

export const FpsText = ({ renderer, x, y, color }: FpsTextProps): Entity => {
  return {
    id: "fpsText",
    components: {
      position: new Position({}),
      renderable: new TextBox({
        renderer: renderer,
        debuggable: false,
        cameraPos: { x: x ?? -35, y: y ?? 5 },
        color: color ?? 0xFFFF00,
        zIndex: 1,
        dynamic: (t: HTMLText, _, g: Game) => {
          if (g.tick % 10 !== 0) return;
          const fps = Math.round(renderer.app.ticker.FPS);
          const color = fps > 100 ? "#00ff00" : fps > 60 ? "yellow" : "red";
          t.text = `<span style=color:${color}>${Math.round(renderer.app.ticker.FPS)}</span>`;
        },
      })
    }
  }
}
