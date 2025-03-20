import {
  GameBuilder, Entity, Position, pixiText, Renderable, pixiGraphics,
  loadTexture, colors, Cursor, Chat, Debug, PixiButton, PC, Team, TeamColors,
  PositionProps,
  World,
  NPC,
} from "@piggo-gg/core"
import { Flappy, Craft, Volley, Jump } from "@piggo-gg/games"
import { Sprite } from "pixi.js"

export const Lobby: GameBuilder = {
  id: "lobby",
  init: () => ({
    id: "lobby",
    state: {},
    systems: [],
    view: "side",
    entities: [
      Cursor(), Chat(),
      Friends(), Profile(), GameLobby(), Players()
    ],
    netcode: "delay"
  })
}

const Icon = (player: Entity<PC | Team>, pos: PositionProps) => {

  const { pc, team } = player.components

  let lastName = ""
  let lastTeam = 0

  let texture: any = undefined

  const text = () => pixiText({
    text: pc.data.name,
    resolution: 2,
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
      position: Position(pos),
      debug: Debug(),
      renderable: Renderable({
        zIndex: 10,
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
        setup: async () => {
          texture = (await loadTexture("piggo-logo.json"))["piggo-logo"]
        }
      })
    }
  })
}

// aligns all the player icons in the center of the screen
const Players = (): Entity => {

  let pcs: (Entity<PC | Team>)[] = []
  let icons: Entity<Position | Renderable>[] = []

  let offset = { x: 0, y: 0 }

  const players = Entity({
    id: "players",
    components: {
      position: Position({ x: 300, y: 100, screenFixed: true }),
      npc: NPC({
        behavior: (_, world) => {
          if (!world.renderer) return

          if (icons.length === 0) {
            const { height, width } = world.renderer.app.screen

            offset = { x: 220 + ((width - 230) / 2), y: height / 2 - 60 }

            // create icons
            pcs = world.queryEntities<PC | Team>(["pc"])
            icons = pcs.map(p => Icon(p, { x: offset.x, y: offset.y, screenFixed: true }))
            world.addEntities(icons)
          }

          const players = world.queryEntities<PC | Team>(["pc"])
          if (players.length !== pcs.length) {
            pcs = players
            icons.forEach(i => world.removeEntity(i.id))
            icons = pcs.map(p => Icon(p, { x: offset.x, y: offset.y, screenFixed: true }))
            world.addEntities(icons)
          }

          // align the icons
          const totalWidth = icons.reduce((acc, icon) => acc + icon.components.renderable.c.width, 0) + 20 * (icons.length - 1)
          let x = -totalWidth / 2
          for (const icon of icons) {
            icon.components.position.setPosition({ x: offset.x + x + icon.components.renderable.c.width / 2 })
            x += icon.components.renderable.c.width + 20
          }
        }
      })
    }
  })
  return players
}

const GameLobby = (): Entity => {

  const list: GameBuilder[] = [Volley, Flappy, Craft, Jump]
  let gameButtons: PixiButton[] = []
  let index = 0
  let invite: undefined | PixiButton = undefined

  const gameLobby = Entity<Position | Renderable>({
    id: "gameLobby",
    components: {
      debug: Debug(),
      position: Position({ x: 220, y: 10, screenFixed: true }),
      renderable: Renderable({
        zIndex: 10,
        dynamic: ({ world }) => {
          gameButtons.forEach((b, i) => {
            b.c.alpha = (i === index) ? 1 : 0.6
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
          outline.roundRect(0, 0, width - 230, height - 20, 3).stroke({ color: colors.piggo, alpha: 0.9, width: 2, miterLimit: 0 })

          gameButtons = []

          list.forEach((g, i) => {
            gameButtons.push(PixiButton({
              content: () => ({
                text: g.id,
                pos: { x: (width - 230) / 2, y: 60 },
                anchor: { x: 0, y: 0 },
                style: { fontSize: 28, fill: 0xffffff },
                strokeAlpha: 1
              }),
              onClick: () => {
                index = i
              }
            }))
          })

          // align the game buttons
          const totalWidth = gameButtons.reduce((acc, b) => acc + b.c.width, 0) + 20 * (gameButtons.length - 1)
          let x = -totalWidth / 2
          for (const gb of gameButtons) {
            gb.c.position.x = x
            x += gb.c.width + 20
          }

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
              style: { fontSize: 20, fill: 0xffffff },
              strokeAlpha: 1
            }),
            onClick: () => world.client?.copyInviteLink()
          })

          r.c.addChild(outline, ...gameButtons.map(b => b.c), play.c, select, invite.c)
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

  const title = pixiText({ text: "friends", style: { fontSize: 20 }, pos: { x: 100, y: 5 }, anchor: { x: 0.5, y: 0 } })

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
