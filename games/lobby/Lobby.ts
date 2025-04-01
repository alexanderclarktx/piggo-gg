import {
  GameBuilder, Entity, Position, pixiText, Renderable, pixiGraphics, colors,
  Cursor, Chat, PixiButton, PC, Team, TeamColors, NPC, arrayEqual, Background,
  Actions, Networked, DudeSkin, Ghost, XY, randomInt, World
} from "@piggo-gg/core"
import { Volley } from "@piggo-gg/games"
import { Text } from "pixi.js"
import toast from "react-hot-toast"

type LobbyState = {
  gameId: "volley"
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
      Background({ moving: true, rays: true }),
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

const PlayerName = (player: Entity<PC | Team>, y: number) => {

  const { pc, team } = player.components

  let lastName = ""
  let lastTeam = 0

  const text = () => pixiText({
    text: pc.data.name,
    pos: { x: 0, y: 60 },
    anchor: { x: 0.5, y: 0.5 },
    style: { fontSize: 24, fill: TeamColors[team.data.team] }
  })

  return Entity<Position | Renderable>({
    id: `playerName-${player.id}`,
    components: {
      position: Position({ screenFixed: true, y }),
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
}

// aligns all the player icons in the center of the screen
const Players = (): Entity => {

  let playerNames: string[] = []
  let icons: Entity<Position | Renderable>[] = []
  let avatars: Entity<Position | Renderable>[] = []

  return Entity({
    id: "players",
    components: {
      position: Position({ x: 300, y: 100, screenFixed: true }),
      npc: NPC({
        behavior: (_, world) => {
          if (!world.renderer) return
          const { width } = world.renderer.wh()
          const offset = { x: 220 + ((width - 230) / 2), y: 250 }

          const players = world.queryEntities<PC | Team>(["pc"]).sort((a, b) => a.components.pc.data.name > b.components.pc.data.name ? 1 : -1)

          // recreate the icons if the player names have changed
          if (icons.length === 0 || !arrayEqual(players.map(p => p.components.pc.data.name), playerNames)) {
            icons.forEach(i => world.removeEntity(i.id))
            avatars.forEach(a => world.removeEntity(a.id))

            icons = players.map(p => PlayerName(p, offset.y))
            avatars = players.map(p => Avatar(p, { x: 0, y: offset.y }, () => {
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
        entity.components.renderable.c.children[0].alpha = alpha
      },
      setup: async (r, _, world) => {
        r.setBevel({ lightAlpha: 0.5, shadowAlpha: 0.2 })

        const button = PixiButton({
          content: () => ({
            text: game.id,
            style: { fontSize: 28, fill: 0xffffff },
            strokeAlpha: 1,
            alpha: 1
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
      position: Position({ x: 300, y: 360, screenFixed: true }),
      renderable: Renderable({
        zIndex: 10,
        interactiveChildren: true,
        setup: async (r, renderer, world) => {
          const state = world.game.state as LobbyState

          const { width } = renderer.wh()
          playButton.components.position.setPosition({ x: 220 + (width - 230) / 2 })

          r.setBevel({ rotation: 90, lightAlpha: 1, shadowAlpha: 0.4 })

          const button = PixiButton({
            content: () => ({
              text: "Play",
              width: 250,
              height: 40,
              style: { fontSize: 26, fill: 0xffffff },
              strokeAlpha: 1,
              alpha: 1
            }),
            onClick: () => {
              world.actions.push(world.tick + 1, "world", { actionId: "game", params: { game: state.gameId } })
              world.actions.push(world.tick + 2, "world", { actionId: "game", params: { game: state.gameId } })
            },
            onEnter: () => button.c.alpha = 1,
            onLeave: () => button.c.alpha = 0.95
          })
          button.c.alpha = 0.95
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
      position: Position({ x: 300, y: 420, screenFixed: true }),
      renderable: Renderable({
        zIndex: 10,
        interactiveChildren: true,
        anchor: { x: 0.5, y: 0.5 },
        dynamic: ({ world }) => {
          const ready = (world.client?.ws.readyState ?? 0) === 1
          createLobbyButton.components.renderable.c.alpha = ready ? 1 : 0.6
          createLobbyButton.components.renderable.c.interactiveChildren = ready
        },
        setup: async (r, renderer, world) => {
          const { width } = renderer.app.screen
          createLobbyButton.components.position.setPosition({ x: 220 + (width - 230) / 2 })

          r.setBevel({ rotation: 90, lightAlpha: 1, shadowAlpha: 0.4 })

          const button = PixiButton({
            content: () => ({
              text: "Invite Friends",
              width: 250,
              height: 40,
              style: { fontSize: 26, fill: 0xffffff },
              strokeAlpha: 1,
              alpha: 1,
            }),
            onClick: () => world.client?.copyInviteLink(),
            onEnter: () => button.c.alpha = 1,
            onLeave: () => button.c.alpha = 0.95
          })
          button.c.alpha = 0.95

          r.c.addChild(button.c)
        }
      })
    }
  })
  return createLobbyButton
}

const Avatar = (player: Entity<PC>, pos: XY, callback?: () => void) => {
  const { pc } = player.components

  let skin: "dude" | "ghost" = pc.data.name.startsWith("noob") ? "dude" : "ghost"

  const avatar = Entity<Position | Renderable>({
    id: `avatar-${randomInt(1000)}`,
    components: {
      position: Position({ ...pos, screenFixed: true }),
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
          const outline = pixiGraphics()
            .roundRect(-100, -75, 200, 170, 3)
            .fill({ color: 0x000000, alpha: 0.5 })
            .stroke({ color: colors.piggo, alpha: 0.8, width: 2 })

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

const SignupCTA = () => Entity<Position | Renderable>({
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

        const outline = pixiGraphics()
          .roundRect(10, 10, 200, 80, 3)
          .fill({ color: 0x000000, alpha: 0.9 })
          .stroke({ color: 0x00ffff, alpha: 1, width: 2 })

        r.c.addChild(outline, text)
      }
    })
  }
})

const Friends = (): Entity => {

  let addFriend: PixiButton | undefined = undefined
  let addFriendInput: PixiButton | undefined = undefined

  let addFriendInputText = ""

  let screenHeight = 0
  let outlineHeight = 0

  const outline = pixiGraphics()
  const drawOutline = () => {
    outline.clear()
    outline.roundRect(0, 0, 200, screenHeight - outlineHeight, 3)
      .fill({ color: 0x000000, alpha: 0.5 })
      .stroke({ color: colors.piggo, alpha: 0.8, width: 2, miterLimit: 0 })
  }

  // let friendList: number[] | undefined = undefined

  const friends = Entity<Position | Renderable>({
    id: "friends",
    components: {
      position: Position({ x: 10, y: 190, screenFixed: true }),
      renderable: Renderable({
        zIndex: 10,
        interactiveChildren: true,
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

          if (addFriendInput!.c.visible) {
            const all = world.client!.bufferDown.all()

            for (const down of all) {
              if (down.key === "backspace") {
                addFriendInputText = addFriendInputText.slice(0, -1)
                continue
              }
              if (down.hold) {
                continue
              }
              const key = down.key.toLowerCase()
              if (key.length === 1) {
                addFriendInputText += key
              }
            }

            // @ts-expect-error
            addFriendInput.c.children[1].text = addFriendInputText
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

          renderable.setBevel({ lightAlpha: 0.5, shadowAlpha: 0.2 })

          addFriendInput = PixiButton({
            content: () => ({
              text: "",
              pos: { x: 100, y: 70 },
              anchor: { x: 0.5, y: 0.5 },
              style: { fontSize: 18, fill: 0xffffff },
              textPos: { x: 20, y: 70 },
              textAnchor: { x: 0, y: 0.5 },
              width: 180,
              strokeAlpha: 1
            })
          })

          addFriend = PixiButton({
            content: () => ({
              text: "add friend",
              pos: { x: 100, y: 30 },
              style: { fontSize: 18, fill: 0xffffff },
              strokeAlpha: 1,
              alpha: 1
            }),
            onClick: () => {
              // addFriendInput!.c.visible = true
              // world.client?.friendsAdd("noob", (response) => {
              //   if ("error" in response) {
              //     toast.error(response.error)
              //   } else {
              //     toast.success("friend request sent")
              //   }
              // })
            },
            onEnter: () => addFriend!.c.alpha = 1,
            onLeave: () => addFriend!.c.alpha = 0.95
          })
          // addFriend.c.alpha = world.client?.token ? 0.95 : 0.6
          addFriend.c.alpha = 0.6
          addFriendInput.c.visible = false

          renderable.c.addChild(outline, addFriend.c, addFriendInput.c)

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
        setup: async (renderable) => {
          text = pixiText({
            text: "",
            style: { fontSize: 18, fill: 0xffffff, alpha: 0.7 },
            anchor: { x: 1, y: 0 }
          })
          renderable.c.addChild(text)
        },
        dynamic: ({ world }) => {
          if (world.tick === 40 || world.tick % 200 === 0) refresh(world)
        }
      })
    }
  })
}

const GameLobby = (): Entity => {

  const list: GameBuilder[] = [Volley]
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
      // npc: NPC({
      //   behavior: (_, world) => {
      //     if (!world.renderer) return
      //     const { height, width } = world.renderer.app.screen

      //     // if (gameButtons.length === 0) {

      //     //   for (const g of list) {
      //     //     const gameButton = GameButton(g)
      //     //     world.addEntity(gameButton)
      //     //     gameButtons.push(gameButton)
      //     //   }
      //     // }

      //     const offset = { x: 220 + ((width - 230) / 2), y: height / 2 - 60 }

      //     // align the game buttons
      //     const totalWidth = gameButtons.reduce((acc, b) => acc + b.components.renderable.c.width, 0) + 20 * (gameButtons.length - 1)
      //     let x = -totalWidth / 2
      //     for (const gb of gameButtons) {
      //       const { width } = gb.components.renderable.c

      //       gb.components.position.data.x = offset.x + x + width / 2
      //       x += width + 20
      //     }
      //   }
      // }),
      renderable: Renderable({
        zIndex: 9,
        interactiveChildren: true,
        setup: async (r, renderer) => {
          const { height, width } = renderer.app.screen

          const outline = pixiGraphics()
          outline.roundRect(0, 0, width - 230, height - 20, 3)
            .stroke({ color: colors.piggo, alpha: 0.8, width: 2, miterLimit: 0 })

          // const select = pixiText({
          //   text: "select game:",
          //   style: { fontSize: 24, dropShadow: true },
          //   pos: { x: (width - 230) / 2, y: 15 },
          //   anchor: { x: 0.5, y: 0 }
          // })

          r.c.addChild(outline)
        }
      })
    }
  })
  return gameLobby
}
