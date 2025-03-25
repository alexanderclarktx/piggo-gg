import { Debug, Entity, PixiButton, pixiGraphics, pixiText, Position, Renderable } from "@piggo-gg/core";
import { Graphics, Text } from "pixi.js";

export const Tooltip = (id: string, text: string) => {

  let explainer: Text | undefined = undefined
  let explainerBg: Graphics | undefined = undefined

  let sinceShown = 1

  const tooltip = Entity<Position>({
    id: `tooltip-${id}`,
    components: {
      position: Position({ x: 400, y: 30, screenFixed: true }),
      debug: Debug(),
      renderable: Renderable({
        visible: true,
        interactiveChildren: true,
        zIndex: 100,
        dynamic: () => {
          if (sinceShown > 300) return

          if (sinceShown >= 1) sinceShown += 1

          if (!explainer || !explainerBg) return

          if (sinceShown > 180) {
            explainer.alpha = 1 - (sinceShown - 180) / 60
            explainerBg.alpha = 1 - (sinceShown - 180) / 60
          }

          if (sinceShown === 0) {
            explainer.alpha = 1
            explainerBg.alpha = 1
          }
        },
        setup: async (renderable, renderer) => {
          const { width } = renderer.app.screen
          tooltip.components.position.setPosition({ x: width / 2 + 85 })

          explainer = pixiText({
            text,
            style: { fill: 0xffffff, fontSize: 20, dropShadow: true, align: "center", resolution: 4 },
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
              style: { fontSize: 26, fill: 0xffffff, dropShadow: true, resolution: 4, fontFamily: "Times New Roman" }
            }),
            onClick: () => { },
            onEnter: () => {
              sinceShown = 0
            },
            onLeave: () => {
              sinceShown = 1
            }
          })

          const circle = pixiGraphics().circle(0, 0, 16).stroke({ color: 0xffffff, width: 2 })

          renderable.c.addChild(icon.c, circle, explainerBg, explainer)
        }
      })
    }
  })
  return tooltip
}
