import { Actions, Button, Clickable, Entity, Position, pixiText } from "@piggo-gg/core";

export const ConnectButton = () => Entity({
  id: "connectButton",
  persists: true,
  components: {
    position: new Position({ x: 75, y: 5, screenFixed: true }),
    actions: new Actions({
      click: {
        invoke: ({ world }) => {
          if (world && world.client) world.client.joinLobby("hub", () => {});
        }
      }
    }),
    clickable: new Clickable({ width: 80, height: 32, active: true }),
    renderable: Button({
      dims: { w: 72, textX: 8, textY: 5 },
      zIndex: 1,
      text: pixiText({ text: "connect", style: { fill: 0xffffff, fontSize: 16 } })
    })
  }
})