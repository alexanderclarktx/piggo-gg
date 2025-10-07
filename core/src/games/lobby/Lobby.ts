import {
  Actions, Background, colors, Craft, Entity, GameBuilder, HButton, HImg, HText,
  HtmlButton, HtmlDiv, LobbiesMenu, Networked, NPC, PC, piggoVersion,
  pixiGraphics, PixiRenderSystem, pixiText, Position, RefreshableDiv,
  Renderable, Strike, Team, TeamColors, Volley, World
} from "@piggo-gg/core"
import { Text } from "pixi.js"

type LobbyState = {
  gameId: "volley" | "craft" | "strike"
}

export const Lobby: GameBuilder = {
  id: "lobby",
  init: (world) => ({
    id: "lobby",
    renderer: "pixi",
    settings: {},
    state: {
      gameId: "volley"
    },
    systems: [PixiRenderSystem],
    entities: [
      Background({ moving: true, rays: true }),
      GameLobby(),
      Version(),
      PlayersOnline(),

      // PixiChat(),
      // Friends(),
      // SignupCTA()
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

          renderable.visible = world.client?.net.synced === true
        },
        setup: async (renderable) => {
          renderable.c.addChild(text())
        }
      })
    }
  })
}

const HtmlGameButton = (game: GameBuilder, world: World) => {
  let rotation = 0

  const button = HButton({
    style: {
      borderRadius: "12px",
      fontSize: "24px",
      position: "relative",
      width: "180px",
      height: "170px",
      transition: "transform 0.8s ease, box-shadow 0.2s ease",

      border: "3px solid transparent",
      backgroundImage: "linear-gradient(black, black), linear-gradient(180deg, white, 90%, #aaaaaa)",
    },
    onClick: () => {
      button.style.transform = `translate(0%, 0%) rotateY(${rotation += 360}deg)`

      world.actions.push(world.tick + 2, "gameLobby", { actionId: "selectGame", params: { gameId: game.id } })
      world.client?.sound.play({ name: "click1" })
    },
    onHover: () => {
      button.style.boxShadow = "0 0 10px 4px white"
      world.client?.sound.play({ name: "click3" })
    },
    onHoverOut: () => {
      button.style.boxShadow = "none"
    }
  },
    HImg({
      src: `${game.id}-256.jpg`,
      style: {
        top: "50%",
        width: "176px",
        height: "166px",
        transform: "translate(-50%, -50%)"
      }
    }),
    HText({
      text: game.id,
      style: { fontSize: "24px", left: "50%", transform: "translate(-50%)", bottom: "-34px", fontWeight: "bold" }
    })
  )
  return button
}

const HtmlPlayButton = (world: World) => {
  const button = HtmlButton({
    text: "Play",
    style: {
      position: "relative",
      left: "50%",
      marginTop: "80px",
      width: "300px",
      height: "42px",
      fontSize: "26px",
      transform: "translate(-50%)",
      textShadow: "none",

      border: "2px solid transparent",
      padding: "0px",
      borderRadius: "6px",
      backgroundImage: "linear-gradient(black, black), linear-gradient(180deg, white, 90%, #999999)",
      backgroundOrigin: "border-box",
      backgroundClip: "content-box, border-box"
    },
    onClick: () => {
      const state = world.state<LobbyState>()
      if (["craft", "strike"].includes(state.gameId)) world.client?.pointerLock()

      world.actions.push(world.tick + 1, "world", { actionId: "game", params: { game: state.gameId } })
      world.actions.push(world.tick + 2, "world", { actionId: "game", params: { game: state.gameId } })

      world.client?.sound.play({ name: "click1" })
    },
    onHover: () => {
      button.style.boxShadow = "0 0 6px 2px white"
      world.client?.sound.play({ name: "click3" })
    },
    onHoverOut: () => {
      button.style.boxShadow = "none"
    }
  })

  return button
}

const Profile = (world: World): RefreshableDiv => {

  let tick = 0
  let frame = -1

  let rotation = 0

  return {
    update: () => {
      tick += 1
      if (tick == 7) {
        frame = (frame + 1) % 4
        tick = 0
      }

      const f1 = document.getElementById("f1") as HTMLImageElement
      const f2 = document.getElementById("f2") as HTMLImageElement
      const f3 = document.getElementById("f3") as HTMLImageElement
      const f4 = document.getElementById("f4") as HTMLImageElement

      const frames = [f1, f2, f3, f4]


      frames.forEach((f, i) => {
        if (frame === -1) f.decode() // prevents flicker
        f.style.visibility = i === frame ? "visible" : "hidden"
      })

      const playerName = world.client?.playerName()
      if (playerName && playerName !== "noob") {
        const name = document.getElementById("profile-name") as HTMLDivElement
        if (name) name.innerText = playerName
      }
    },
    div: HButton({
      style: {
        top: "16px",
        left: "16px",
        width: "200px",
        height: "170px",
        transition: "transform 0.8s ease"
      },
      onClick: (button) => {
        button.style.transform = `translate(0%, 0%) rotateY(${rotation += 360}deg)`
      },
    },
      HImg({
        style: {
          width: "92px",
          borderRadius: "8px",
          imageRendering: "pixelated",
          pointerEvents: "auto",
          visibility: "hidden",
          transform: "translate(-50%, -60%)"
        },
        id: "f1",
        src: "f1.png"
      }),
      HImg({
        style: {
          width: "92px",
          borderRadius: "8px",
          imageRendering: "pixelated",
          pointerEvents: "auto",
          visibility: "hidden",
          transform: "translate(-50%, -60%)"
        },
        id: "f2",
        src: "f2.png"
      }),
      HImg({
        style: {
          width: "92px",
          borderRadius: "8px",
          imageRendering: "pixelated",
          pointerEvents: "auto",
          visibility: "hidden",
          transform: "translate(-50%, -60%)"
        },
        id: "f3",
        src: "f3.png"
      }),
      HImg({
        style: {
          width: "92px",
          borderRadius: "8px",
          imageRendering: "pixelated",
          pointerEvents: "auto",
          visibility: "hidden",
          transform: "translate(-50%, -62%)"
        },
        id: "f4",
        src: "f4.png"
      }),
      HText({
        id: "profile-name",
        text: "noob",
        style: {
          fontSize: "32px",
          color: "#ffc0cb",
          left: "50%",
          top: "120px",
          transform: "translate(-50%)"
        }
      })
    )
  }
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

const Version = () => {
  return Entity({
    id: "version",
    components: {
      position: Position({ x: -15, y: -30, screenFixed: true }),
      renderable: Renderable({
        zIndex: 10,
        setup: async (r) => {
          const text = pixiText({
            text: `v${piggoVersion}`,
            style: { fontSize: 16, alpha: 0.7 },
            anchor: { x: 1, y: 0 }
          })
          r.c.addChild(text)
        }
      })
    }
  })
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
      position: Position({ x: -15, y: 15, screenFixed: true }),
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

  const list: GameBuilder[] = [Volley, Craft, Strike]

  let gameButtons: HTMLButtonElement[] = []

  let lobbiesMenu: RefreshableDiv | undefined = undefined

  let profile: RefreshableDiv | undefined = undefined

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

          if (gameButtons.length === 0) {

            profile = Profile(world)

            document.body.appendChild(profile.div)

            const shell = HtmlDiv({
              left: "50%",
              top: "14%",
              transform: "translate(-50%)",
              display: "flex",
              border: "none",
              flexDirection: "column"
            })

            const gameButtonsShell = HtmlDiv({
              position: "relative",
              display: "flex",
              gap: "20px",
              flexDirection: "row",
              transform: "translate(-50%)",
              left: "50%",
              border: "none"
            })
            shell.appendChild(gameButtonsShell)

            for (const g of list) {
              const htmlButton = HtmlGameButton(g, world)
              gameButtonsShell.appendChild(htmlButton)
              gameButtons.push(htmlButton)
            }

            document.body.appendChild(shell)

            const htmlPlayButton = HtmlPlayButton(world)
            shell.appendChild(htmlPlayButton)

            const lobbiesShell = HtmlDiv({
              transform: "translate(-50%)",
              left: "50%",
              width: "404px",
              height: "220px",
              marginTop: "40px",
              border: "none",
              position: "relative"
            })

            lobbiesMenu = LobbiesMenu(world)
            lobbiesShell.appendChild(lobbiesMenu.div)
            shell.appendChild(lobbiesShell)
          }

          if (world.client) {
            lobbiesMenu?.update()
            profile?.update()
          }

          // make border green for selected game
          const state = world.game.state as LobbyState
          for (const button of gameButtons) {
            const selected = button.innerText === state.gameId
            button.style.outline = selected ? "2px solid #00dd88" : "none"
          }
        }
      })
    }
  })
  return gameLobby
}
