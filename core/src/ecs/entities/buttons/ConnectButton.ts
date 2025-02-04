import { Actions, Button, Clickable, Entity, Position, pixiText } from "@piggo-gg/core"

export const ConnectButton = () => Entity({
  id: "connectButton",
  persists: true,
  components: {
    position: Position({ x: -75, y: 5, screenFixed: true }),
    clickable: Clickable({ width: 80, height: 32, active: true }),
    actions: Actions({
      click: ({ world }) => world.client?.lobbyJoin("hub", () => { })
    }),
    renderable: Button({
      dims: { w: 72, textX: 8, textY: 5 },
      zIndex: 1,
      text: pixiText({ text: "connect", style: { fill: 0xffffff, fontSize: 16 } })
    })
  }
})
