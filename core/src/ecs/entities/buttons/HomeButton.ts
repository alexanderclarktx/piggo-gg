import { Actions, Button, Clickable, Entity, Position, pixiText } from "@piggo-gg/core"

export const HomeButton = () => Entity({
  id: "homeButton",
  components: {
    position: Position({ x: 5, y: 5, screenFixed: true }),
    clickable: Clickable({ width: 80, height: 32, active: true }),
    actions: Actions({
      click: ({ world }) => {
        world.actionBuffer.push(world.tick + 1, "world",
          { actionId: "game", playerId: world.client?.player.id, params: { game: "home" } }
        )
      }
    }),
    renderable: Button({
      dims: { w: 55, textX: 8, textY: 5 },
      zIndex: 1,
      text: pixiText({ text: "home", style: { fill: 0xffffff, fontSize: 16 } })
    })
  }
})
