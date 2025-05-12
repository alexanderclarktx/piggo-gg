import { Debug, Entity, PixiButton, pixiGraphics, pixiText, Position, Renderable } from "@piggo-gg/core"
import { Graphics, Text } from "pixi.js"

export const Tooltip = (id: string, text: string) => {

  let explainer: Text | undefined = undefined
  let explainerBg: Graphics | undefined = undefined

  let show = 600

  const tooltip = Entity<Position>({
    id: `tooltip-${id}`,
    components: {
      position: Position({ x: 400, y: 30, screenFixed: true }),
      debug: Debug(),
      renderable: Renderable({
        visible: true,
        interactiveChildren: true,
        zIndex: 8,
        onTick: () => {
          if (!explainer || !explainerBg) return

          if (show <= 0) {
            explainer.alpha = 0
            explainerBg.alpha = 0
            return
          } else if (show < 40) {
            explainer.alpha = show / 40
            explainerBg.alpha = show / 40
          } else {
            explainer.alpha = 1
            explainerBg.alpha = 1
          }

          show -= 1
        },
        setup: async (renderable, renderer) => {
          const { width } = renderer.app.screen
          tooltip.components.position.setPosition({ x: width / 2 + 85 })

          explainer = pixiText({
            text,
            style: { fill: 0xffffff, fontSize: 20 },
            pos: { x: 30, y: -20 },
            anchor: { x: 0, y: 0 },
          })

          explainerBg = pixiGraphics()
            .roundRect(25, -25, explainer.width + 10, explainer.height + 10, 5)
            .fill({ color: 0x000000, alpha: 0.7 })
            .stroke({ color: 0xffffff, width: 2 })

          const icon = PixiButton({
            content: () => ({
              text: "i",
              pos: { x: 0, y: 0 },
              anchor: { x: 0.45, y: 0.5 },
              style: { fontSize: 26, fill: 0xffffff, dropShadow: true, fontFamily: "Times New Roman" },
              strokeAlpha: 0,
              fillAlpha: 0
            }),
            onEnter: () => show = 900,
            onLeave: () => show = 200
          })

          const circle = pixiGraphics().circle(0, 0, 16)
            .fill({ color: 0x000000, alpha: 1 })
            .stroke({ color: 0xffffff, width: 2 })

          renderable.c.addChild(circle, icon.c, explainerBg, explainer)
        }
      })
    }
  })
  return tooltip
}
