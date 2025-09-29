import { Entity, Position, Renderable, PixiRenderer, round, max, min } from "@piggo-gg/core"
import { Graphics } from "pixi.js"

export const Cursor = (): Entity => {

  const cursor = Entity<Renderable | Position>({
    id: "cursor",
    components: {
      position: Position({ x: 2000, y: 2000, screenFixed: true }),
      renderable: Renderable({
        interpolate: true,
        onRender: ({ client, world }) => {
          const { x, y } = client.controls.mouse
          // const rect = world.pixi?.app.canvas.getBoundingClientRect()
          // if (!rect) return
          const { width, height } = world.pixi?.wh() ?? { width: 800, height: 600 }

          cursor.components.position.data.x = x
          cursor.components.position.data.y = y
        },
        setContainer: async (r: PixiRenderer) => {
          // r.app.canvas.addEventListener("pointermove", (event) => {
          //   const rect = r.app.canvas.getBoundingClientRect()

            // cursor.components.position.data.x = round(event.clientX - rect.left - 2)
            // cursor.components.position.data.y = round(event.clientY - rect.top - 2)
          // })

          const circle = new Graphics()
          circle.circle(0, 0, 4)
          circle.fill({ color: 0x00FFFF })

          return circle
        },
        zIndex: 12
      })
    }
  })

  return cursor
}
