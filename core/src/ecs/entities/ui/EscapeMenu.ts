import { Actions, Entity, Renderable, Position, pixiGraphics, Input, PixiButton } from "@piggo-gg/core";

export const EscapeMenu = (): Entity => {
  let visible = false

  const escapeMenu = Entity<Position | Renderable>({
    id: "escapeMenu",
    components: {
      position: Position({ x: 0, y: 0, screenFixed: true }),
      input: Input({
        press: { "escape": ({ world }) => ({ actionId: "toggleVisible", playerId: world.client?.playerId() }) }
      }),
      actions: Actions({
        toggleVisible: () => {
          visible = !visible
          escapeMenu.components.renderable.visible = visible
        }
      }),
      renderable: Renderable({
        zIndex: 11,
        visible: false,
        interactiveChildren: true,
        setup: async (renderable, renderer, world) => {
          const { width, height } = renderer.app.screen

          const background = pixiGraphics()
          const outline = pixiGraphics()

          const fontSize = 30

          const returnToLobby = PixiButton({
            content: () => ({
              text: "Return to Lobby",
              pos: { x: width / 2, y: (height / 2) - 100 },
              style: { fill: 0xffffff, fontSize }
            }),
            onClick: () => {
              world.actions.push(world.tick + 1, "world", { actionId: "game", params: { game: "lobby" } })
            }
          })

          const settings = PixiButton({
            content: () => ({
              text: "Settings",
              pos: { x: width / 2, y: (height / 2) },
              style: { fill: 0xaaaaaa, fontSize }
            }),
            onClick: () => {
              console.log("Settings")
            }
          })

          const about = PixiButton({
            content: () => ({
              text: "About",
              pos: { x: width / 2, y: (height / 2) + 100 },
              style: { fill: 0xaaaaaa, fontSize }
            }),
            onClick: () => {
              console.log("About")
            }
          })

          background.rect(0, 0, width, height).fill({ color: 0x000000, alpha: 0.7 })
          outline.roundRect(100, 100, width - 200, height - 200).stroke({ color: 0xffffff, alpha: 1, width: 2 })

          renderable.c.addChild(background, outline, returnToLobby.c, settings.c, about.c)
        }
      })
    }
  })
  return escapeMenu
}
