import { Debug, Entity, PixiButton, pixiGraphics, pixiText, Position, Renderable } from "@piggo-gg/core";

export const Tooltip = (id: string, text: string) => {

  let explainer = pixiText({
    text,
    style: { fill: 0xffffff, fontSize: 20, dropShadow: true },
    pos: { x: 30, y: -20 },
    anchor: { x: 0, y: 0 },
  })

  let explainerBg = pixiGraphics()
    .roundRect(25, -25, explainer.width + 20, explainer.height + 10, 5)
    .fill({ color: 0x000000, alpha: 0.8 })
    .stroke({ color: 0xffffff, width: 2 })

  explainer.visible = false
  explainerBg.visible = false

  let icon = PixiButton({
    content: () => ({
      text: "i",
      pos: { x: 0, y: 0 },
      anchor: { x: 0.45, y: 0.5 },
      style: { fontSize: 26, fill: 0xffffff, dropShadow: true, resolution: 4, fontFamily: "Times New Roman" }
    }),
    onClick: () => { },
    onEnter: () => {
      explainer.visible = true
      explainerBg.visible = true
    },
    onLeave: () => {
      explainer.visible = false
      explainerBg.visible = false
    }
  })

  let circle = pixiGraphics().circle(0, 0, 16).stroke({ color: 0xffffff, width: 2 })

  const tooltip = Entity<Position>({
    id: `tooltip-${id}`,
    components: {
      position: Position({ x: 400, y: 30, screenFixed: true }),
      debug: Debug(),
      renderable: Renderable({
        visible: true,
        interactiveChildren: true,
        zIndex: 100,
        setup: async (renderable, renderer) => {
          const { width } = renderer.app.screen
          tooltip.components.position.setPosition({ x: width / 2 + 85 })

          renderable.c.addChild(icon.c, circle, explainerBg, explainer)
        }
      })
    }
  })
  return tooltip
}
