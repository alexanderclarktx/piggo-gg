import {
  GameBuilder, Entity, Position, pixiText, Renderable, pixiGraphics, colors, Cursor, Chat,
  PixiButton, PC, Team, TeamColors, NPC, arrayEqual, Background, Actions, Networked, DudeSkin,
  Ghost, XY, randomInt, World, loadTexture, MusicBox, RenderSystem, pixiContainer, pixiRect
} from "@piggo-gg/core"
import { Volley, Craft, DDE } from "@piggo-gg/games"
import { Container, Sprite, Text } from "pixi.js"
import { Friends } from "./Friends"

type LobbyState = {
  gameId: "volley" | "craft" | "Duck Duck Eagle"
}

export const Lobby: GameBuilder = {
  id: "lobby",
  init: (world) => ({
    id: "lobby",
    state: {
      gameId: "Duck Duck Eagle"
    },
    systems: [RenderSystem],
    entities: [
      Background({ moving: true, rays: true }),
      Cursor(),
      Chat(),
      // Friends(),
      Profile(),
      // SignupCTA(),
      ...[world.client?.player ? [Avatar(world.client.player, { x: 110, y: 80 })] : []].flat(),
      GameLobby(),
      Players(),
      PlayButton(),
      CreateLobbyButton(),
      // SettingsButton(),
      PlayersOnline(),
      MusicBox()
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
        onTick: async ({ renderable, world }) => {
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
    position: Position({ x: 0, y: 160, screenFixed: true }),
    renderable: Renderable({
      zIndex: 10,
      interactiveChildren: true,
      onTick: ({ world, renderable }) => {
        const state = world.game.state as LobbyState
        if (state.gameId === game.id) {
          renderable.setOutline({ color: 0x00ff88, thickness: 1 })
        } else {
          renderable.setOutline()
        }
      },
      setup: async (r, _, world) => {
        r.setBevel({ rotation: 90, lightAlpha: 1, shadowAlpha: 0.3 })

        const button = PixiButton({
          content: () => ({
            text: game.id,
            textAnchor: { x: 0.5, y: 0.5 },
            textPos: { x: 0, y: 90 },
            style: { fontSize: 24 },
            rounded: 14,
            height: 240,
            width: 270
          }),
          // onClick: () => {
          //   world.actions.push(world.tick + 2, "gameLobby", { actionId: "selectGame", params: { gameId: game.id } })
          //   world.client?.soundManager.play("click1")
          // },
          // onEnter: () => {
          //   r.setGlow({ outerStrength: 2 })
          //   world.client?.soundManager.play("click3")
          // },
          // onLeave: () => r.setGlow()
        })

        r.c.addChild(button.c)

        let icon: Container = pixiContainer()

        if (game.id === "craft") {
          const textures = await loadTexture("pickaxe.json")
          // icon = new Sprite({ texture: textures["0"], scale: 10, anchor: { x: 0.5, y: 0.3 } })
        } else if (game.id === "volley") {
          const textures = await loadTexture("vball.json")
          // icon = new Sprite({ texture: textures["0"], scale: 2, anchor: { x: 0.5, y: 0.2 } })
        } else {
          const textures = await loadTexture("dde-art.json")
          const g = pixiRect({ rounded: 10, x: -80, y: -80, w: 160, h: 160, style: { strokeWidth: 0 } }).fill({ texture: textures["0"] })
          g.position.set(0, -20)
          icon = g
        }
        // icon.texture.source.scaleMode = "nearest"

        r.c.addChild(icon)
      }
    })
  }
})

const PlayButton = () => {
  const playButton = Entity<Position>({
    id: "playButton",
    components: {
      position: Position({ x: 300, y: 380, screenFixed: true }),
      renderable: Renderable({
        zIndex: 10,
        interactiveChildren: true,
        setup: async (r, renderer, world) => {
          const state = world.game.state as LobbyState

          const { width } = renderer.wh()
          playButton.components.position.setPosition({ x: width / 2 })

          r.setBevel({ rotation: 90, lightAlpha: 1, shadowAlpha: 0.3 })

          const button = PixiButton({
            content: () => ({
              text: "Play",
              width: 300,
              height: 40,
              style: { fontSize: 26 }
            }),
            onClick: () => {
              world.actions.push(world.tick + 1, "world", { actionId: "game", params: { game: state.gameId } })
              world.actions.push(world.tick + 2, "world", { actionId: "game", params: { game: state.gameId } })
              world.client?.soundManager.play("click1")
            },
            onEnter: () => {
              r.setGlow({ outerStrength: 2 })
              world.client?.soundManager.play("click3")
            },
            onLeave: () => {
              r.setGlow()
            }
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
      position: Position({ x: 300, y: 440, screenFixed: true }),
      renderable: Renderable({
        zIndex: 10,
        interactiveChildren: true,
        anchor: { x: 0.5, y: 0.5 },
        onTick: ({ world }) => {
          // const ready = (world.client?.ws.readyState ?? 0) === 1
          const ready = false
          createLobbyButton.components.renderable.c.alpha = ready ? 1 : 0.6
          createLobbyButton.components.renderable.c.interactiveChildren = ready
        },
        setup: async (r, renderer, world) => {
          const { width } = renderer.app.screen
          createLobbyButton.components.position.setPosition({ x: width / 2 })

          r.setBevel({ rotation: 90, lightAlpha: 1, shadowAlpha: 0.3 })

          const button = PixiButton({
            content: () => ({
              text: "Invite Friends",
              width: 300,
              height: 40,
              style: { fontSize: 26 }
            }),
            onClick: () => {
              world.client?.copyInviteLink()

              world.client?.soundManager.play("click1")
            },
            onEnter: () => {
              r.setGlow({ outerStrength: 2 })
              world.client?.soundManager.play("click3")
            },
            onLeave: () => r.setGlow()
          })

          r.c.addChild(button.c)
        }
      })
    }
  })
  return createLobbyButton
}

const SettingsButton = () => {
  const settingsButton = Entity<Position>({
    id: "settingsButton",
    components: {
      position: Position({ x: 300, y: 480, screenFixed: true }),
      renderable: Renderable({
        zIndex: 10,
        interactiveChildren: true,
        setup: async (r, renderer, world) => {
          const { width } = renderer.wh()
          settingsButton.components.position.setPosition({ x: 220 + (width - 230) / 2 })

          r.setBevel({ rotation: 90, lightAlpha: 1, shadowAlpha: 0.3 })

          const button = PixiButton({
            content: () => ({
              text: "Settings",
              width: 300,
              height: 40,
              style: { fontSize: 26 }
            }),
            onClick: () => {
              console.log("Settings")
              world.client?.soundManager.play("click1")
            },
            onEnter: () => {
              r.setGlow({ outerStrength: 2 })
              world.client?.soundManager.play("click3")
            },
            onLeave: () => r.setGlow()
          })
          r.c.addChild(button.c)
        }
      })
    }
  })
  return settingsButton
}

// todo player param optional ?
const Avatar = (player: Entity<PC>, pos: XY, callback?: () => void) => {
  const { pc } = player.components

  let skin: "dude" | "ghost" = pc.data.name.startsWith("noob") ? "dude" : "ghost"

  const avatar = Entity<Position | Renderable>({
    id: `avatar-${randomInt(1000)}`,
    components: {
      position: Position({ ...pos, screenFixed: true }),
      renderable: Renderable({
        zIndex: 11,
        anchor: { x: 0.55, y: 0.5 },
        scale: 3.5,
        scaleMode: "nearest",
        animationSelect: () => "idle",
        interactiveChildren: true,
        onTick: ({ world }) => {
          if (!player.components.pc.data.name.startsWith("noob") && skin !== "ghost") {
            skin = "ghost"
            if (world.renderer) world.renderer.resizedFlag = true
          }
        },
        setup: async (r, _, world) => {
          await (skin === "dude" ? DudeSkin("white")(r) : Ghost(r))

          if (callback) {
            r.c.interactive = true
            r.c.onpointerdown = callback
          }

          // if (!world.client?.token && pos.y === 85) {
          //   avatar.components.position.setPosition({ x: 110, y: 175 })
          // }
        }
      })
    }
  })
  return avatar
}

const Profile = (): Entity => {

  const playerName = pixiText({
    text: "Profile",
    style: { fontSize: 34, fill: colors.piggo },
    pos: { x: 0, y: 50 },
    anchor: { x: 0.5, y: 0 }
  })

  const profile = Entity<Position | Renderable>({
    id: "profile",
    components: {
      position: Position({ x: 110, y: 85, screenFixed: true }),
      renderable: Renderable({
        zIndex: 10,
        onTick: ({ world }) => {
          const name = world.client?.playerName()
          if (name && playerName.text !== name) {
            playerName.text = name
          }
        },
        setup: async (renderable) => {
          const outline = pixiGraphics()
            .roundRect(-100, -75, 200, 170, 10)
            .fill({ color: 0x000000, alpha: 1 })
            .stroke({ color: 0xffffff, width: 2 })

          renderable.c.addChild(outline, playerName)

          renderable.setBevel({ rotation: 90, lightAlpha: 1, shadowAlpha: 0.3 })
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
      onTick: ({ world, renderable }) => {
        if (!world.client) return
        renderable.visible = !world.client.token
      },
      setup: async (r) => {
        const text = pixiText({
          text: "^\nSign In for\na cool skin!",
          anchor: { x: 0.5, y: 0.9 },
          style: { align: "center", fontSize: 18, fontWeight: "bold" },
          pos: { x: 90, y: 65 }
        })

        const outline = pixiGraphics()
          .roundRect(10, 10, 160, 70, 10)
          .fill({ color: 0x000000, alpha: 0.9 })
          .stroke({ color: 0x00ffff, alpha: 1, width: 2 })

        r.c.addChild(outline, text)

        r.setBevel({ rotation: 90, lightAlpha: 0.8, shadowAlpha: 0.4 })
      }
    })
  }
})

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
      position: Position({ x: -10, y: 10, screenFixed: true }),
      renderable: Renderable({
        zIndex: 10,
        setup: async (renderable) => {
          text = pixiText({
            text: "",
            style: { fontSize: 18, alpha: 0.7 },
            anchor: { x: 1, y: 0 }
          })
          renderable.c.addChild(text)
        },
        onTick: ({ world }) => {
          if (world.tick === 40 || world.tick % 200 === 0) refresh(world)
        }
      })
    }
  })
}

const GameLobby = (): Entity => {

  const list: GameBuilder[] = [DDE]
  let gameButtons: Entity<Position | Renderable>[] = []

  const gameLobby = Entity<Position>({
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

          const offset = { x: width / 2, y: height / 2 - 60 }

          // align the game buttons
          const totalWidth = gameButtons.reduce((acc, b) => acc + b.components.renderable.c.width, 0) + 20 * (gameButtons.length - 1)
          let x = -totalWidth / 2
          for (const gb of gameButtons) {
            const { width } = gb.components.renderable.c

            gb.components.position.data.x = offset.x + x + width / 2
            x += width + 20
          }
        }
      })
    }
  })
  return gameLobby
}
