import { Renderable, pixiGraphics } from "@piggo-gg/core"

export const DebugBounds = (debugRenderable: Renderable): Renderable => {

  const renderable = Renderable({
    onTick: ({ container, renderable }) => {
      container.position = { ...debugRenderable.position }
      renderable.visible = debugRenderable.visible
    },
    setup: async (r: Renderable, _, world) => {

      // get the bounds of the renderable
      const bounds = debugRenderable.c.getLocalBounds()
      if (bounds.width === 0 && bounds.height === 0) {
        setTimeout(() => renderable.setup?.(r, renderable.renderer, world), 100)
        return
      }

      const drawing = pixiGraphics()

      // center circle
      drawing.circle(0, 0, 2)
      drawing.fill(0xff00ff)

      // bounds rectangle
      drawing.setStrokeStyle({ width: 1, color: 0xff0000 })
      drawing.rect(bounds.x, bounds.y, bounds.width, bounds.height)
      drawing.stroke()

      r.c.addChild(drawing)
    }
  })

  return renderable
}
