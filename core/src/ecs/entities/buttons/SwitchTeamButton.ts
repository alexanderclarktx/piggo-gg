import { Entity, PixiButton, Position, Renderable } from "@piggo-gg/core"

export const switchTeamButton = () => Entity({
  id: "switchTeamButton",
  components: {
    position: Position({ x: 0, y: 0, screenFixed: true }),
    renderable: Renderable({
      zIndex: 1,
      interactiveChildren: true,
      visible: false,
      onTick: ({ renderable, world }) => {
        renderable.visible = world.client?.connected ?? false
      },
      setup: async (renderable, renderer, world) => {
        const { width } = renderer.wh()

        renderable.setBevel({ rotation: 90, lightAlpha: 1, shadowAlpha: 0.4 })

        const button = PixiButton({
          content: () => ({
            text: "switch team",
            pos: { y: 30, x: width / 2 - 140 },
            style: { fontSize: 18, fill: 0xffffff }
          }),
          onClick: () => {
            world.client?.clickThisFrame.set(world.tick + 1)
            world.actions.push(world.tick + 2, world.client!.playerId(), { actionId: "switchTeam" })
          },
          onEnter: () => button.c.alpha = 1,
          onLeave: () => button.c.alpha = 0.95
        })
        button.c.alpha = 0.95

        renderable.c.addChild(button.c)
      }
    })
  }
})
