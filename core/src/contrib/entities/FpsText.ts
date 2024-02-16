import { Entity, World } from "@piggo-legends/core";
import { Position, Renderable } from "@piggo-legends/core";
import { Text } from "pixi.js";

export type FpsTextProps = {
  x?: number,
  y?: number,
  color?: number
}

export const FpsText = ({ x, y, color }: FpsTextProps = {}): Entity => {
  return {
    id: "fpsText",
    components: {
      position: new Position({
        x: x ?? -35, y: y ?? 5, screenFixed: true
      }),
      renderable: new Renderable({
        color: color ?? 0xFFFF00,
        zIndex: 1,
        container: async () => new Text("", { fontSize: 16, fill: "#FFFFFF" }),
        dynamic: (t: Text, _, __, w: World) => {
          if (w.tick % 10 !== 0) return;
          if (t) {
            const fps = Math.round(w.renderer?.app.ticker.FPS ?? 0);
            t.style.fill = fps > 100 ? "#00ff00" : fps > 60 ? "yellow" : "red";
            t.text = `${fps}`;
          }
        }
      })
    }
  }
}
