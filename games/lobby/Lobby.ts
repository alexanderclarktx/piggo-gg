import {
  GameBuilder, Entity, Position, pixiText, Renderable, pixiGraphics,
  loadTexture, colors, Cursor, Chat, Debug, PixiButton
} from "@piggo-gg/core"
import { Animals, Flappy, Sandbox, Soccer } from "@piggo-gg/games"
import { Sprite } from "pixi.js"

export const Lobby: GameBuilder = {
  id: "lobby",
  init: () => ({
    id: "lobby",
    systems: [],
    view: "side",
    entities: [
      Cursor(), Chat(),
      Friends(), Profile(), GameLobby()
    ]
  })
}

const GameLobby = (): Entity => {

  let height = 0
  let width = 0

  const list: GameBuilder[] = [Flappy, Soccer, Sandbox, Animals]
  let index = 0

  let gameButton: PixiButton | undefined = undefined

  const outline = pixiGraphics()
  const drawOutline = () => {
    outline.clear()
    outline.roundRect(0, 0, width - 230, height - 20, 3).stroke({ color: colors.piggo, alpha: 0.9, width: 2, miterLimit: 0 })
  }

  const gameLobby = Entity<Position | Renderable>({
    id: "gameLobby",
    components: {
      debug: Debug(),
      position: Position({ x: 220, y: 10, screenFixed: true }),
      renderable: Renderable({
        zIndex: 10,
        dynamic: ({ world }) => {
          if (height !== world.renderer!.app.screen.height || width !== world.renderer!.app.screen.width) {
            height = world.renderer!.app.screen.height
            width = world.renderer!.app.screen.width
            // drawOutline()
            // gameButton?.redraw()
          }
        },
        interactiveChildren: true,
        setup: async (r, _, world) => {

          height = world.renderer!.app.screen.height
          width = world.renderer!.app.screen.width

          gameButton = PixiButton({
            content: () => ({
              text: list[index].id,
              pos: { x: (width - 230) / 2, y: (height - 20) / 2 - 40 },
              anchor: { x: 0.5, y: 0 },
              style: { fontSize: 20, fill: 0xffffff }
            }),
            onClick: () => {
              index = (index + 1) % list.length
              gameButton?.redraw()
            }
          })

          const selectGame = pixiText({
            text: "select game:",
            style: { fontSize: 20 },
            pos: { x: (width - 230) / 2, y: (height - 20) / 2 - 80 },
            anchor: { x: 0.5, y: 0 }
          })

          const playGame = PixiButton({
            content: () => ({
              text: "play",
              pos: { x: (width - 230) / 2, y: (height - 20) / 2 + 40 },
              anchor: { x: 0.5, y: 0 },
              style: { fontSize: 60, fill: 0xffccff },
              strokeAlpha: 0
            }),
            onClick: () => {
              world.setGame(list[index].id)
            }
          })

          r.c.addChild(outline, gameButton.c, playGame.c, selectGame)
          drawOutline()
        }
      })
    }
  })
  return gameLobby
}

const Profile = (): Entity => {

  const playerName = pixiText({ text: "Profile", style: { fontSize: 32 }, pos: { x: 100, y: 120 }, anchor: { x: 0.5, y: 0 } })

  const outline = pixiGraphics()
  const drawOutline = () => {
    outline.clear()
    outline.roundRect(0, 0, 200, 170, 3).stroke({ color: colors.piggo, alpha: 0.9, width: 2 })
  }

  const profile = Entity<Position | Renderable>({
    id: "profile",
    components: {
      position: Position({ x: 10, y: 10, screenFixed: true }),
      renderable: Renderable({
        zIndex: 10,
        dynamic: ({ world }) => {
          const name = world.client?.playerName()
          if (name && playerName.text !== name) {
            playerName.text = name
          }
        },
        setup: async (r) => {
          drawOutline()

          const texture = (await loadTexture("piggo-logo.json"))["piggo-logo"]
          const pfp = new Sprite({ texture, scale: 1.5, anchor: 0.5, position: { x: 100, y: 70 } })

          r.c.addChild(outline, playerName, pfp)
        }
      })
    }
  })
  return profile
}

const Friends = (): Entity => {

  const title = pixiText({ text: "add friend", style: { fontSize: 20 }, pos: { x: 100, y: 5 }, anchor: { x: 0.5, y: 0 } })

  let height = 0

  const outline = pixiGraphics()
  const drawOutline = () => {
    outline.clear()
    outline.roundRect(0, 0, 200, height - 200, 3).stroke({ color: colors.piggo, alpha: 0.9, width: 2, miterLimit: 0 })
  }

  // let friendList: Friend[] | undefined = undefined

  const friends = Entity<Position | Renderable>({
    id: "friends",
    components: {
      position: Position({ x: 10, y: 190, screenFixed: true }),
      renderable: Renderable({
        zIndex: 10,
        dynamic: ({ world }) => {
          if (height !== world.renderer!.app.screen.height) {
            height = world.renderer!.app.screen.height
            drawOutline()
          }

          // if (friendList === undefined) {
          //   friendList = []
          //   world.client?.friendsList((response) => {
          //     if ("error" in response) {
          //       friendList = []
          //     } else {
          //       friendList = response.friends
          //     }
          //   })
          // }
        },
        setup: async (r) => {
          drawOutline()
          r.c.addChild(outline, title)
        }
      })
    }
  })
  return friends
}
