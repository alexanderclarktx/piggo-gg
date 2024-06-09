import { Entity, Position, Renderable, World, pixiText } from "@piggo-gg/core";
import { Text } from "pixi.js";

export type FpsTextProps = {
  x?: number
  y?: number
}

export const FpsText = ({ x, y }: FpsTextProps = {}) => Entity<Position | Renderable>({
  id: "fpsText",
  persists: true,
  components: {
    position: Position({
      x: x ?? -60, y: y ?? 5, screenFixed: true
    }),
    renderable: Renderable({
      zIndex: 3,
      setContainer: async () => pixiText({ text: "", style: { fontSize: 14, fill: 0x00ff00 } }),
      dynamic: (t: Text, _, __, w: World) => {
        if (w.tick % 5 !== 0) return;
        if (t) {
          const fps = Math.round(w.renderer?.app.ticker.FPS ?? 0);
          // if (t.style) t.style.fill = fps > 100 ? "#00ff00" : fps > 60 ? "yellow" : "red";
          t.text = `fps: ${fps}`;
        }
      }
    })
  }
})

export const LagText = ({ x, y }: FpsTextProps = {}) => Entity<Position | Renderable>({
  id: "lagText",
  persists: true,
  components: {
    position: Position({
      x: x ?? -60, y: y ?? 25, screenFixed: true
    }),
    renderable: Renderable({
      zIndex: 3,
      setContainer: async () => pixiText({ text: "", style: { fontSize: 14, fill: 0x00ff00 } }),
      dynamic: (t: Text, _, __, w: World) => {
        const lag = Math.round(w.client?.ms ?? 0);
        if (w.tick % 5 !== 0) return;
        if (t) {
          // t.style.fill = lag < 50 ? "#00ff00" : lag < 200 ? "yellow" : "red";
          t.text = `ms: ${lag}`;
        }
      }
    })
  }
})
