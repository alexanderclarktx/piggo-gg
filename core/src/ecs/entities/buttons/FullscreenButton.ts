import { Action, Actions, Button, Clickable, Entity, Position, pixiText } from "@piggo-gg/core";

export const FullscreenButton = (id: string = "fullscreenButton") => Entity({
  id: id,
  components: {
    position: Position({ x: -40, y: 5, screenFixed: true }),
    clickable: Clickable({ active: true, width: 32, height: 30 }),
    actions: Actions({
      click: Action(({ world }) => {
        if (!document.fullscreenElement) {
          world.renderer?.app.canvas.requestFullscreen?.();
        } else {
          document.exitFullscreen();
        }
      })
    }),
    renderable: Button({
      dims: { w: 32, textX: 7, textY: 2 },
      zIndex: 4,
      text: pixiText({ text: "⛶", style: { fill: 0xffffff, fontSize: 22 } })
    })
  }
});
