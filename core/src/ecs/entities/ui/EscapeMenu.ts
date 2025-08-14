import { Actions, Entity, Renderable, Position, pixiGraphics, Input, PixiButton } from "@piggo-gg/core"

export const EscapeMenu = (): Entity => {

  let visible = false
  const fontSize = 26

  const background = Renderable({
    zIndex: 9,
    setup: async (renderable, renderer) => {
      const { width, height } = renderer.app.screen
      const background = pixiGraphics()
      background.rect(0, 0, width, height).fill({ color: 0x000000, alpha: 0.5 })
      renderable.c = background
    }
  })

  const outline = Renderable({
    zIndex: 10,
    setup: async (renderable, renderer) => {
      const { width, height } = renderer.app.screen

      const outline = pixiGraphics().roundRect(
        100, 100, width - 200, height - 200, 3
      ).stroke({ color: 0xffffff, alpha: 1, width: 2 })

      renderable.c = outline
    }
  })

  const returnToLobby = Renderable({
    zIndex: 10,
    interactiveChildren: true,
    setup: async (renderable, renderer, world) => {
      const { width, height } = renderer.app.screen

      const returnToLobby = PixiButton({
        content: () => ({
          text: "Return to Lobby",
          pos: { x: width / 2, y: (height / 2) - 100 },
          style: { fontSize },
          width: 300
        }),
        onClick: () => {
          world.actions.push(world.tick + 2, "world", { actionId: "game", params: { game: "lobby" } })
          world.client?.sound.play({ soundName: "click1" })
        },
        onEnter: () => {
          renderable.setGlow({ outerStrength: 2 })
          world.client?.sound.play({ soundName: "click3" })
        },
        onLeave: () => renderable.setGlow()
      })
      renderable.c = returnToLobby.c

      renderable.setBevel({ rotation: 90, lightAlpha: 1, shadowAlpha: 0.3 })
    }
  })

  const settings = Renderable({
    zIndex: 10,
    interactiveChildren: true,
    setup: async (renderable, renderer, world) => {
      const { width, height } = renderer.app.screen

      const settings = PixiButton({
        content: () => ({
          text: "Settings",
          pos: { x: width / 2, y: (height / 2) - 45 },
          style: { fontSize },
          width: 300
        }),
        onClick: () => {
          world.client?.sound.play({ soundName: "click1" })
        },
        onEnter: () => {
          renderable.setGlow({ outerStrength: 2 })
          world.client?.sound.play({ soundName: "click3" })
        },
        onLeave: () => renderable.setGlow()
      })
      renderable.c = settings.c

      renderable.setBevel({ rotation: 90, lightAlpha: 1, shadowAlpha: 0.3 })
    }
  })

  const escapeMenu = Entity<Position | Renderable>({
    id: "escapeMenu",
    components: {
      position: Position({ x: 0, y: 0, screenFixed: true }),
      input: Input({
        press: {
          "escape": ({ hold }) => {
            if (hold) return null
            return { actionId: "toggleVisible", offline: true }
          }
        }
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
        setChildren: async () => [returnToLobby, settings, background]
      })
    }
  })
  return escapeMenu
}
