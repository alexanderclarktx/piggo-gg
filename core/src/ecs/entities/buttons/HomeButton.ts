import { Actions, Button, Clickable, Entity, Position, pixiText } from "@piggo-gg/core";

export const HomeButton = () => Entity({
  id: "homeButton",
  components: {
    position: new Position({ x: 45, y: 5, screenFixed: true }),
    clickable: new Clickable({ width: 80, height: 32, active: true }),
    actions: new Actions({
      click: {
        invoke: ({ world }) => world.setGame("home")
      }
    }),
    renderable: Button({
      dims: { w: 55, textX: 8, textY: 5 },
      zIndex: 1,
      text: pixiText({ text: "home", style: { fill: 0xffffff, fontSize: 16 } })
    })
  }
})
