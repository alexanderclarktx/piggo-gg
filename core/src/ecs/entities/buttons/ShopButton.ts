import { Actions, Button, Clickable, Entity, Position, pixiText } from "@piggo-gg/core";

export const ShopButton = () => Entity({
  id: "shopButton",
  components: {
    position: Position({ x: -55, y: 5, screenFixed: true }),
    clickable: Clickable({ width: 45, height: 32, active: true }),
    actions: Actions({
      click: {
        invoke: ({ world }) => {
          world.actionBuffer.push(world.tick + 1, "shop",
            { action: "toggleVisible", playerId: world.client?.playerEntity.id }
          );
        }
      }
    }),
    renderable: Button({
      dims: { w: 50, textX: 8, textY: 5 },
      zIndex: 1,
      text: pixiText({ text: "shop", style: { fill: 0xffffff, fontSize: 16 } })
    })
  }
})
