import {
  GameBuilder, Entity, Position, pixiText, Renderable, pixiGraphics, colors,
  Cursor, Chat, PixiButton, PC, Team, TeamColors, NPC, arrayEqual, Background,
  Actions, Networked, DudeSkin, Ghost, XY, Debug, randomInt, World
} from "@piggo-gg/core"
import { Craft, Volley } from "@piggo-gg/games"
import { Text } from "pixi.js"

type LobbyState = {
  gameId: "volley" | "craft"
}

export const Lobby: GameBuilder = {
  id: "lobby",
  init: (world) => ({
    id: "lobby",
    state: {
      gameId: "volley"
    },
    systems: [],
    view: "side",
    entities: [
      Background({ moving: true }),
      Cursor(),
      Chat(),
      Friends(),
      Profile(),
      SignupCTA(),
      ...[world.client?.player ? [Avatar(world.client.player, { x: 110, y: 85 })] : []].flat(),
      GameLobby(),
      Players(),
      PlayButton(),
      CreateLobbyButton(),
      PlayersOnline()
    ],
    netcode: "delay"
  })
}

const Icon = (player: Entity<PC | Team>) => {

  const { pc, team } = player.components

  let lastName = ""
  let lastTeam = 0

  const text = () => pixiText({
    text: pc.data.name,
    pos: { x: 0, y: 40 },
    anchor: { x: 0.5, y: 0.5 },
    style: { fontSize: 24, fill: TeamColors[team.data.team] }
  })

  const icon = Entity<Position | Renderable>({
    id: `icon-${player.id}`,
    components: {
      position: Position({ screenFixed: true, y: 350 }),
      renderable: Renderable({
        zIndex: 12,
        interactiveChildren: true,
        visible: false,
        dynamic: async ({ renderable, world }) => {
          if (pc.data.name !== lastName || team.data.team !== lastTeam) {
            renderable.c.removeChildren()
            renderable.c.addChild(text())

            lastName = pc.data.name
            lastTeam = team.data.team
          }

          renderable.visible = world.client?.connected === true
        },
        setup: async (renderable) => {
          renderable.c.addChild(text())
        }
      })
    }
  })
  return icon
}

// aligns all the player icons in the center of the screen
const Players = (): Entity => {

  let playerNames: string[] = []
  let icons: Entity<Position | Renderable>[] = []
  let avatars: Entity<Position | Renderable>[] = []

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
            avatars.forEach(a => world.removeEntity(a.id))

            icons = players.map(p => Icon(p))
            avatars = players.map(p => Avatar(p, { x: 0, y: 330 }, () => {
              world.actions.push(world.tick + 2, p.id, { actionId: "switchTeam" })
            }))
            world.addEntities(icons)
            world.addEntities(avatars)

            playerNames = players.map(p => p.components.pc.data.name)
          }

          // align the icons
          const totalWidth = icons.reduce((acc, icon) => acc + icon.components.renderable.c.width, 0) + 20 * (icons.length - 1)
          let x = -totalWidth / 2
          for (const [index, icon] of icons.entries()) {
            icon.components.position.setPosition({ x: offset.x + x + icon.components.renderable.c.width / 2 })

            const avatar = avatars[index]
            avatar.components.renderable.visible = world.client?.connected === true
            avatar.components.position.setPosition({ x: offset.x + x + icon.components.renderable.c.width / 2 })

            x += icon.components.renderable.c.width + 20
          }
        }
      })
    }
  })
}

const GameButton = (game: GameBuilder) => Entity<Position | Renderable>({
  id: `gamebutton-${game.id}`,
  components: {
    position: Position({ x: 0, y: 85, screenFixed: true }),
    renderable: Renderable({
      zIndex: 10,
      interactiveChildren: true,
      dynamic: ({ world, entity }) => {
        const state = world.game.state as LobbyState
        const alpha = state.gameId === game.id ? 1 : 0.6
        // const color = state.gameId === game.id ? 0xffcccc : 0xffffff
        entity.components.renderable.c.children[0].alpha = alpha
      },
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
            world.actions.push(world.tick + 2, "gameLobby", { actionId: "selectGame", params: { gameId: game.id } })
          }
        })
        r.c.addChild(button.c)
      }
    })
  }
})

const PlayButton = () => {
  const playButton = Entity<Position>({
    id: "playButton",
    components: {
      position: Position({ x: 300, y: 120, screenFixed: true }),
      renderable: Renderable({
        zIndex: 10,
        interactiveChildren: true,
        setup: async (r, renderer, world) => {
          const state = world.game.state as LobbyState

          const { width } = renderer.app.screen
          playButton.components.position.setPosition({ x: 220 + (width - 230) / 2 })

          const button = PixiButton({
            content: () => ({
              text: "play",
              pos: { x: 0, y: 0 },
              anchor: { x: 0.5, y: 0 },
              style: { fontSize: 72, fill: 0xffccff, dropShadow: true }
            }),
            onClick: () => {
              world.actions.push(world.tick + 1, "world", { actionId: "game", params: { game: state.gameId } })
              world.actions.push(world.tick + 2, "world", { actionId: "game", params: { game: state.gameId } })
            },
            onEnter: () => r.color = 0xffcccc,
            onLeave: () => r.color = 0xffffff
          })
          r.c.addChild(button.c)
        }
      })
    }
  })
  return playButton
}

const CreateLobbyButton = () => {
  const createLobbyButton = Entity<Position | Renderable>({
    id: "createLobbyButton",
    components: {
      position: Position({ x: 300, y: 450, screenFixed: true }),
      renderable: Renderable({
        zIndex: 10,
        interactiveChildren: true,
        anchor: { x: 0.5, y: 0.5 },
        alpha: 0.6,
        dynamic: ({ world }) => {
          const ready = (world.client?.ws.readyState ?? 0) === 1
          createLobbyButton.components.renderable.c.alpha = ready ? 1 : 0.6
          createLobbyButton.components.renderable.c.interactiveChildren = ready
        },
        setup: async (r, renderer, world) => {
          const { width } = renderer.app.screen

          createLobbyButton.components.position.setPosition({ x: 220 + (width - 230) / 2 })

          const button = PixiButton({
            content: () => ({
              text: "Create Lobby",
              pos: { x: 0, y: 0 },
              anchor: { x: 0.5, y: 0.5 },
              style: { fontSize: 26, fill: 0xffffff },
              strokeAlpha: 1
            }),
            onClick: () => world.client?.copyInviteLink(),
            onEnter: () => r.color = 0xddffff,
            onLeave: () => r.color = 0xffffff
          })
          r.c.addChild(button.c)
        }
      })
    }
  })
  return createLobbyButton
}

const GameLobby = (): Entity => {

  const list: GameBuilder[] = [Volley, Craft]
  let gameButtons: Entity<Position | Renderable>[] = []

  const gameLobby = Entity<Position | Renderable>({
    id: "gameLobby",
    components: {
      position: Position({ x: 220, y: 10, screenFixed: true }),
      networked: Networked(),
      actions: Actions({
        "selectGame": ({ world, params }) => {
          if (!params) return
          const state = world.game.state as LobbyState
          state.gameId = params.gameId
        }
      }),
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
        interactiveChildren: true,
        setup: async (r, renderer) => {
          const { height, width } = renderer.app.screen

          const outline = pixiGraphics()
          outline.roundRect(0, 0, width - 230, height - 20, 3).stroke({ color: colors.piggo, alpha: 0.7, width: 2, miterLimit: 0 })

          const select = pixiText({
            text: "select game:",
            style: { fontSize: 24 },
            pos: { x: (width - 230) / 2, y: 15 },
            anchor: { x: 0.5, y: 0 }
          })

          r.c.addChild(outline, select)
        }
      })
    }
  })
  return gameLobby
}

const Avatar = (player: Entity<PC>, pos: XY, callback?: () => void) => {
  const { pc } = player.components

  let skin: "dude" | "ghost" = pc.data.name.startsWith("noob") ? "dude" : "ghost"

  const avatar = Entity<Position | Renderable>({
    id: `avatar-${randomInt(1000)}`,
    components: {
      position: Position({ ...pos, screenFixed: true }),
      debug: Debug(),
      renderable: Renderable({
        zIndex: 10,
        anchor: { x: 0.55, y: 0.5 },
        scale: 3.5,
        scaleMode: "nearest",
        animationSelect: () => "idle",
        interactiveChildren: true,
        dynamic: ({ world }) => {
          if (!player.components.pc.data.name.startsWith("noob") && skin !== "ghost") {
            skin = "ghost"
            if (world.renderer) world.renderer.resizedFlag = true
          }

          if (world.client?.token && avatar.components.position.data.y !== 85 && pos.y === 85) {
            avatar.components.position.setPosition({ x: 110, y: 85 })
          }
        },
        setup: async (r, _, world) => {
          await (skin === "dude" ? DudeSkin("white")(r) : Ghost(r))

          if (callback) {
            r.c.interactive = true
            r.c.onpointerdown = callback
          }

          if (!world.client?.token && pos.y === 85) {
            avatar.components.position.setPosition({ x: 110, y: 175 })
          }
        }
      })
    }
  })
  return avatar
}

const Profile = (): Entity => {

  const playerName = pixiText({
    text: "Profile",
    style: { fontSize: 32 },
    pos: { x: 0, y: 50 },
    anchor: { x: 0.5, y: 0 }
  })

  const outline = pixiGraphics()
  const drawOutline = () => {
    outline.clear()
    outline.roundRect(-100, -75, 200, 170, 3).stroke({ color: colors.piggo, alpha: 0.7, width: 2 })
  }

  const profile = Entity<Position | Renderable>({
    id: "profile",
    components: {
      position: Position({ x: 110, y: 85, screenFixed: true }),
      renderable: Renderable({
        zIndex: 10,
        dynamic: ({ world }) => {
          const name = world.client?.playerName()
          if (name && playerName.text !== name) {
            playerName.text = name
          }

          if (world.client?.token && profile.components.position.data.y !== 85) {
            profile.components.position.setPosition({ x: 110, y: 85 })
          }
        },
        setup: async (renderable, _, world) => {
          drawOutline()
          renderable.c.addChild(outline, playerName)

          if (!world.client?.token) {
            profile.components.position.setPosition({ x: 110, y: 175 })
          }
        }
      })
    }
  })
  return profile
}

const SignupCTA = () => {

  const outline = pixiGraphics()
  const drawOutline = () => {
    outline.clear()
    outline.roundRect(10, 10, 200, 80, 3).stroke({ color: 0x00ffff, alpha: 1, width: 2 }).fill({ color: 0x000000, alpha: 0.9 })
  }

  return Entity<Position | Renderable>({
    id: "signupCTA",
    components: {
      position: Position({ x: 0, y: 0, screenFixed: true }),
      renderable: Renderable({
        zIndex: 10,
        interactiveChildren: true,
        visible: false,
        dynamic: ({ world, renderable }) => {
          if (!world.client) return
          renderable.visible = !world.client.token
        },
        setup: async (r) => {

          const text = pixiText({
            text: "^\nSign In\nfor a free skin!",
            anchor: { x: 0.5, y: 0.9 },
            style: { align: "center", fontSize: 18, fontWeight: "bold" },
            pos: { x: 110, y: 70 }
          })

          drawOutline()
          r.c.addChild(outline, text)
        }
      })
    }
  })
}

const Friends = (): Entity => {

  const title = pixiText({ text: "friends", style: { fontSize: 20 }, pos: { x: 100, y: 5 }, anchor: { x: 0.5, y: 0 } })

  const friendsOnline = pixiText({ text: "friends online: 0/0", style: { fontSize: 16 }, pos: { x: 100, y: 10 }, anchor: { x: 0.5, y: 0 } })

  let screenHeight = 0
  let outlineHeight = 0

  const outline = pixiGraphics()
  const drawOutline = () => {
    outline.clear()
    outline.roundRect(0, 0, 200, screenHeight - outlineHeight, 3).stroke({ color: colors.piggo, alpha: 0.7, width: 2, miterLimit: 0 })
  }

  // let friendList: number[] | undefined = undefined

  const friends = Entity<Position | Renderable>({
    id: "friends",
    components: {
      position: Position({ x: 10, y: 190, screenFixed: true }),
      renderable: Renderable({
        zIndex: 10,
        dynamic: ({ world }) => {
          if (!world.renderer) return

          if (world.client?.token && outlineHeight === 290) {
            friends.components.position.setPosition({ x: 10, y: 190 })
          }

          const h = world.client?.token ? 200 : 290

          if (outlineHeight !== h) {
            outlineHeight = h
            drawOutline()
          }

          if (screenHeight !== world.renderer.app.screen.height) {
            screenHeight = world.renderer.app.screen.height
            drawOutline()
          }

          // if (friendList === undefined) {
          //   friendList = []
          // world.client?.friendsList((response) => {
          //   if ("error" in response) {
          //     friendList = []
          //   } else {
          //     friendList = response.friends
          //   }
          // })
          // }
        },
        setup: async (renderable, _, world) => {
          drawOutline()
          renderable.c.addChild(outline, friendsOnline)

          if (!world.client?.token) {
            friends.components.position.setPosition({ x: 10, y: 280 })
          }
        }
      })
    }
  })
  return friends
}

const PlayersOnline = () => {

  let text: Text | undefined = undefined

  const refresh = (world: World) => {
    world.client?.metaPlayers((response) => {
      if ("error" in response) return
      if (text) text.text = `players online: ${response.online}`
    })
  }

  return Entity({
    id: "playersOnline",
    components: {
      position: Position({ x: -20, y: 20, screenFixed: true }),
      renderable: Renderable({
        zIndex: 10,
        setup: async (renderable, _, world) => {
          text = pixiText({ text: "", style: { fontSize: 16, fill: 0x00ffff }, anchor: { x: 1, y: 0 } })
          renderable.c.addChild(text)

          refresh(world)
        },
        dynamic: ({ world }) => {
          if (world.tick % 200 === 0) refresh(world)
        }
      })
    }
  })
}
