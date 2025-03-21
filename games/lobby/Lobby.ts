import {
  GameBuilder, Entity, Position, pixiText, Renderable, pixiGraphics, loadTexture, colors,
  Cursor, Chat, PixiButton, PC, Team, TeamColors, World, NPC, arrayEqual, Background
} from "@piggo-gg/core"
import { Flappy, Craft, Volley } from "@piggo-gg/games"
import { Sprite } from "pixi.js"

export const Lobby: GameBuilder = {
  id: "lobby",
  init: () => ({
    id: "lobby",
    state: {},
    systems: [],
    view: "side",
    entities: [
      Background({ moving: true }),
      Cursor(),
      Chat(),
      Friends(),
      Profile(),
      GameLobby(),
      Players()
    ],
    netcode: "delay"
  })
}

const Icon = (player: Entity<PC | Team>) => {

  const { pc, team } = player.components

  let lastName = ""
  let lastTeam = 0

  let texture: any = undefined

  const text = () => pixiText({
    text: pc.data.name,
    resolution: 4,
    pos: { x: 0, y: 40 },
    anchor: { x: 0.5, y: 0.5 },
    style: { fontSize: 24, fill: TeamColors[team.data.team] }
  })

  const pfp = async (world: World) => {
    const sprite = new Sprite({ texture, scale: 0.9, anchor: 0.5, position: { x: 0, y: 0 } })
    sprite.interactive = true
    sprite.onpointerdown = () => {
      world.actions.push(world.tick + 2, player.id, { actionId: "switchTeam" })
    }
    return sprite
  }

  return Entity<Position | Renderable>({
    id: `icon-${player.id}`,
    components: {
      position: Position({ screenFixed: true }),
      renderable: Renderable({
        zIndex: 12,
        interactiveChildren: true,
        visible: false,
        dynamic: async ({ renderable, world }) => {
          if (pc.data.name !== lastName || team.data.team !== lastTeam) {
            renderable.c.removeChildren()
            renderable.c.addChild(text(), await pfp(world))

            lastName = pc.data.name
            lastTeam = team.data.team
          }

          renderable.visible = world.client?.connected === true
        },
        setup: async (renderable, _, world) => {
          texture = (await loadTexture("piggo-logo.json"))["piggo-logo"]

          renderable.c.addChild(text(), await pfp(world))
        }
      })
    }
  })
}

// aligns all the player icons in the center of the screen
const Players = (): Entity => {

  let playerNames: string[] = []
  let icons: Entity<Position | Renderable>[] = []

  let offset = { x: 0, y: 0 }

  return Entity({
    id: "players",
    components: {
      position: Position({ x: 300, y: 100, screenFixed: true }),
      npc: NPC({
        behavior: (_, world) => {
          if (!world.renderer) return
          const { height, width } = world.renderer.app.screen
          offset = { x: 220 + ((width - 230) / 2), y: height / 2 - 60 }

          const players = world.queryEntities<PC | Team>(["pc"]).sort((a, b) => a.components.pc.data.name > b.components.pc.data.name ? 1 : -1)

          // recreate the icons if the player names have changed
          if (icons.length === 0 || !arrayEqual(players.map(p => p.components.pc.data.name), playerNames)) {
            icons.forEach(i => world.removeEntity(i.id))

            icons = players.map(p => Icon(p))
            world.addEntities(icons)

            playerNames = players.map(p => p.components.pc.data.name)
          }

          // align the icons
          const totalWidth = icons.reduce((acc, icon) => acc + icon.components.renderable.c.width, 0) + 20 * (icons.length - 1)
          let x = -totalWidth / 2
          for (const icon of icons) {
            icon.components.position.setPosition({ y: offset.y, x: offset.x + x + icon.components.renderable.c.width / 2 })
            x += icon.components.renderable.c.width + 20
          }
        }
      })
    }
  })
}

const GameButton = (game: GameBuilder) => {

  return Entity<Position | Renderable>({
    id: `gamebutton-${game.id}`,
    components: {
      position: Position({ x: 0, y: 85, screenFixed: true }),
      renderable: Renderable({
        zIndex: 10,
        interactiveChildren: true,
        setup: async (r, _, world) => {
          const button = PixiButton({
            content: () => ({
              text: game.id,
              pos: { x: 0, y: 0 },
              anchor: { x: 0.5, y: 0.5 },
              style: { fontSize: 28, fill: 0xffffff },
              strokeAlpha: 1
            }),
            onClick: () => {
              world.actions.push(world.tick + 1, "world", { actionId: "game", params: { game: game.id } })
            }
          })
          r.c.addChild(button.c)
        }
      })
    }
  })
}

const GameLobby = (): Entity => {

  const list: GameBuilder[] = [Volley, Flappy, Craft]
  let gameButtons: Entity<Position | Renderable>[] = []
  let index = 0
  let invite: undefined | PixiButton = undefined

  const gameLobby = Entity<Position | Renderable>({
    id: "gameLobby",
    components: {
      position: Position({ x: 220, y: 10, screenFixed: true }),
      npc: NPC({
        behavior: (_, world) => {
          if (!world.renderer) return
          const { height, width } = world.renderer.app.screen

          if (gameButtons.length === 0) {

            for (const g of list) {
              const gameButton = GameButton(g)
              world.addEntity(gameButton)
              gameButtons.push(gameButton)
            }
          }

          const offset = { x: 220 + ((width - 230) / 2), y: height / 2 - 60 }

          // align the game buttons
          const totalWidth = gameButtons.reduce((acc, b) => acc + b.components.renderable.c.width, 0) + 20 * (gameButtons.length - 1)
          let x = -totalWidth / 2
          for (const gb of gameButtons) {
            const { width } = gb.components.renderable.c

            gb.components.position.data.x = offset.x + x + width / 2
            x += width + 20
          }
        }
      }),
      renderable: Renderable({
        zIndex: 9,
        dynamic: ({ world }) => {
          gameButtons.forEach((button, i) => {
            button.components.renderable.c.alpha = (i === index) ? 1 : 0.6
          })

          if (invite) {
            invite.c.alpha = (world.client?.ws.readyState ?? 0) === 1 ? 1 : 0.6
            invite.c.interactive = (world.client?.ws.readyState ?? 0) === 1
          }
        },
        interactiveChildren: true,
        setup: async (r, renderer, world) => {
          const { height, width } = renderer.app.screen

          const outline = pixiGraphics()
          outline.roundRect(0, 0, width - 230, height - 20, 3).stroke({ color: colors.piggo, alpha: 0.7, width: 2, miterLimit: 0 })

          const select = pixiText({
            text: "select game:",
            style: { fontSize: 24 },
            pos: { x: (width - 230) / 2, y: 15 },
            anchor: { x: 0.5, y: 0 }
          })

          const play = PixiButton({
            content: () => ({
              text: "play",
              pos: { x: (width - 230) / 2, y: 110 },
              anchor: { x: 0.5, y: 0 },
              style: { fontSize: 72, fill: 0xffccff }
            }),
            onClick: () => {
              world.actions.push(world.tick + 1, "world", { actionId: "game", params: { game: list[index].id } })
              world.actions.push(world.tick + 2, "world", { actionId: "game", params: { game: list[index].id } })
            }
          })

          invite = PixiButton({
            content: () => ({
              text: "Create Lobby",
              pos: { x: (width - 230) / 2, y: (height - 20) / 2 + 20 },
              anchor: { x: 0.5, y: 0 },
              style: { fontSize: 26, fill: 0xffffff },
              strokeAlpha: 1
            }),
            onClick: () => world.client?.copyInviteLink()
          })

          r.c.addChild(outline, play.c, select, invite.c)
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
    outline.roundRect(0, 0, 200, 170, 3).stroke({ color: colors.piggo, alpha: 0.7, width: 2 })
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

  const title = pixiText({ text: "friends", style: { fontSize: 20 }, pos: { x: 100, y: 5 }, anchor: { x: 0.5, y: 0 } })

  let height = 0

  const outline = pixiGraphics()
  const drawOutline = () => {
    outline.clear()
    outline.roundRect(0, 0, 200, height - 200, 3).stroke({ color: colors.piggo, alpha: 0.7, width: 2, miterLimit: 0 })
  }

  // let friendList: Friend[] | undefined = undefined

  const friends = Entity<Position | Renderable>({
    id: "friends",
    components: {
      position: Position({ x: 10, y: 190, screenFixed: true }),
      renderable: Renderable({
        zIndex: 10,
        dynamic: ({ world }) => {
          if (!world.renderer) return

          if (height !== world.renderer.app.screen.height) {
            height = world.renderer.app.screen.height
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
          r.c.addChild(outline)
        }
      })
    }
  })
  return friends
}
