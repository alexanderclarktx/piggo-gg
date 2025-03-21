import { Entity, PixiButton, Position, Renderable } from "@piggo-gg/core"

export const switchTeamButton = () => Entity({
  id: "switchTeamButton",
  components: {
    position: Position({ x: 0, y: 0, screenFixed: true }),
    renderable: Renderable({
      zIndex: 1,
      interactiveChildren: true,
      visible: false,
      dynamic: ({ renderable, world }) => {
        renderable.visible = world.client?.connected ?? false
      },
      setup: async (renderable, renderer, world) => {
        const width = renderer.app.screen.width

        const button = PixiButton({
          content: () => ({
            text: "change team",
            pos: { y: 20, x: width / 2 - 140 },
            style: { fontSize: 18, fill: 0xffffff },
            strokeAlpha: 0.5
          }),
          onClick: () => {
            world.client?.clickThisFrame.set(world.tick + 1)
            world.actions.push(world.tick + 2, world.client!.playerId(), { actionId: "switchTeam" })
          }
        })

        renderable.c.addChild(button.c)
      }
    })
  }
})
