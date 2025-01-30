import { Entity, Position, Renderable, World, pixiText, round } from "@piggo-gg/core"
import { Text } from "pixi.js"

export type FpsTextProps = {
  x?: number
  y?: number
}

export const FpsText = ({ x, y }: FpsTextProps = {}) => Entity<Position | Renderable>({
  id: "fpsText",
  persists: true,
  components: {
    position: Position({
      x: x ?? 5, y: y ?? 10, screenFixed: true
    }),
    renderable: Renderable({
      zIndex: 3,
      setContainer: async () => pixiText({ text: "", style: { fontSize: 16, fill: 0x00ff00 } }),
      dynamic: ({ container, world }) => {
        if (world.tick % 5 !== 0) return

        const t = container as Text
        if (t) {
          const fps = round(world.renderer?.app.ticker.FPS ?? 0)
          // if (t.style) t.style.fill = fps > 100 ? "#00ff00" : fps > 60 ? "yellow" : "red"
          t.text = `fps: ${fps}`
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
      x: x ?? 5, y: y ?? 30, screenFixed: true
    }),
    renderable: Renderable({
      zIndex: 3,
      setContainer: async () => pixiText({ text: "", style: { fontSize: 16, fill: 0x00ff00 } }),
      dynamic: ({ container, world }) => {
        const lag = round(world.client?.ms ?? 0)
        if (world.tick % 5 !== 0) return

        const t = container as Text
        if (t) {
          // t.style.fill = lag < 50 ? "#00ff00" : lag < 200 ? "yellow" : "red"
          t.text = `ms: ${lag}`
        }
      }
    })
  }
})
