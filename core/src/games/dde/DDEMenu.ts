import {
  Entity, HtmlDiv, NPC, Position, HtmlImg, HtmlText, HtmlButton,
  World, entries, keys, HtmlStyleProps, styleButton
} from "@piggo-gg/core"

type SubMenu = {
  div: HTMLDivElement
  onTick: () => void
}

export const DDEMenu = (world: World): Entity => {

  let init = false
  let activeMenu: "lobbies" | "skins" | "settings" = "lobbies"

  const ddeMenu = HtmlDiv({
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    display: "block",
    pointerEvents: "none"
  })

  const art = Art()

  const menuButtonStyle: HtmlStyleProps = {
    width: "130px", position: "relative", top: "-10px", height: "40px", pointerEvents: "auto"
  }

  const lobbiesButton = HtmlButton({
    text: "lobbies",
    style: menuButtonStyle,
    onClick: () => {
      activeMenu = "lobbies"
    }
  })

  const skinsButton = HtmlButton({
    text: "skins",
    style: menuButtonStyle,
    onClick: () => {
      activeMenu = "skins"
    }
  })

  const settingsButton = HtmlButton({
    text: "settings",
    style: menuButtonStyle,
    onClick: () => {
      activeMenu = "settings"
    }
  })

  const submenuButtons = HtmlDiv({
    position: "relative",
    top: "10px",
    width: "404px",
    display: "flex",
    justifyContent: "space-between"
  })

  submenuButtons.appendChild(lobbiesButton)
  submenuButtons.appendChild(skinsButton)
  submenuButtons.appendChild(settingsButton)

  const lobbies = Lobbies(world)
  const skins = Skins()
  const settings = Settings()

  ddeMenu.appendChild(art)
  ddeMenu.appendChild(submenuButtons)
  ddeMenu.appendChild(lobbies.div)
  ddeMenu.appendChild(skins.div)
  ddeMenu.appendChild(settings.div)

  const menu = Entity({
    id: "DDEMenu",
    components: {
      position: Position({ x: 0, y: 0, z: 0 }),
      npc: NPC({
        behavior: (_, world) => {
          if (world.mode === "server") return

          if (!init) {
            world.three?.append(ddeMenu)
            init = true
          }

          // overall visibility
          const hidden = Boolean(document.pointerLockElement) || world.client?.mobile
          ddeMenu.style.visibility = hidden ? "hidden" : "visible"

          if (hidden) return

          // menu buttons
          styleButton(lobbiesButton, activeMenu === "lobbies", lobbiesButton.matches(":hover"))
          styleButton(skinsButton, activeMenu === "skins", skinsButton.matches(":hover"))
          styleButton(settingsButton, activeMenu === "settings", settingsButton.matches(":hover"))

          // visibility of submenus
          lobbies.div.style.display = activeMenu === "lobbies" ? "block" : "none"
          skins.div.style.display = activeMenu === "skins" ? "block" : "none"
          settings.div.style.display = activeMenu === "settings" ? "block" : "none"

          lobbies.onTick()
        }
      })
    }
  })
  return menu
}

const Lobbies = (world: World): SubMenu => {

  let polled = -60
  let inLobby: string = ""

  const lobbyList = HtmlDiv({
    width: "380px",
    height: "230px",
    left: "50%",
    top: "10px",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    border: "2px solid #bbbbbb",
    borderRadius: "10px",
    overflow: "scroll",
    scrollbarWidth: "thin",
    transform: "translate(-50%)",
    display: "flex",
    flexDirection: "column"
  })

  const createLobby = HtmlButton({
    text: "Create Lobby",
    style: {
      bottom: "10px", left: "10px", height: "40px", width: "186px"
    },
    onClick: () => {
      if (inLobby) return

      world.client?.lobbyCreate(({ lobbyId }) => {
        inLobby = lobbyId
        polled = world.tick - 70
      })
    }
  })

  const leaveLobby = HtmlButton({
    text: "Leave Lobby",
    style: {
      bottom: "10px", right: "10px", height: "40px", width: "186px"
    },
    onClick: () => {
      if (!inLobby) return

      world.client?.lobbyLeave()

      polled = world.tick - 70
      inLobby = ""
    }
  })

  const lobbies = HtmlDiv({
    top: "5px",
    left: "50%",
    width: "400px",
    height: "300px",
    transform: "translate(-50%)",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    pointerEvents: "auto",
    border: "2px solid #ffffff",
    borderRadius: "10px",
    position: "relative"
  })

  lobbies.appendChild(lobbyList)
  lobbies.appendChild(createLobby)
  lobbies.appendChild(leaveLobby)

  return {
    div: lobbies,
    onTick: () => {

      styleButton(createLobby, Boolean(inLobby), createLobby.matches(":hover"))
      styleButton(leaveLobby, Boolean(!inLobby), leaveLobby.matches(":hover"))

      if (world.tick - 80 > polled) {
        polled = world.tick
        world.client?.lobbyList((response) => {
          lobbyList.innerHTML = ""

          for (const [id, meta] of entries(response.lobbies)) {
            const lobby = HtmlText({
              text: `(${meta.players}) ${meta.creator} ${id}`,
              style: {
                width: "70%",
                height: "36px",
                left: "5px",
                fontSize: "16px",
                lineHeight: "36px",
                textAlign: "center",
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                border: meta.id === inLobby ? "2px solid #aaffaa" : "2px solid #aaffff",
                borderRadius: "8px"
              }
            })

            const button = HtmlButton({
              text: "Join",
              onHover: () => {
                button.style.backgroundColor = "rgba(0, 160, 255, 0.4)"
              },
              onHoverOut: () => {
                button.style.backgroundColor = "rgba(0, 0, 0, 0.4)"
              },
              onClick: () => {
                world.client?.lobbyJoin(meta.id, () => {
                  inLobby = meta.id
                  polled = world.tick - 70
                })
              },
              style: {
                width: "25%",
                height: "40px",
                fontSize: "16px",
                right: "5px",
                border: meta.id === inLobby ? "2px solid #bbbbbb" : "2px solid #ffffff",
                color: meta.id === inLobby ? "#bbbbbb" : "#ffffff",
                backgroundColor: meta.id === inLobby ? "rgba(0, 0, 0, 0)" : "rgba(0, 0, 0, 0.4)",
                pointerEvents: meta.id === inLobby ? "none" : "auto",
                position: "relative",
                float: "right"
              }
            })

            const lobbyWrapper = HtmlDiv({
              position: "relative",
              marginTop: "5px"
            })

            lobbyWrapper.appendChild(lobby)
            lobbyWrapper.appendChild(button)

            lobbyList.appendChild(lobbyWrapper)
          }

          if (keys(response.lobbies).length === 0) {
            inLobby = ""
          }
        })
      }
    }
  }
}

const Skins = (): SubMenu => {
  const skins = HtmlDiv({
    top: "5px",
    left: "50%",
    width: "400px",
    height: "300px",
    transform: "translate(-50%)",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    pointerEvents: "auto",
    border: "2px solid #ffffff",
    borderRadius: "10px",
    position: "relative"
  })

  return {
    div: skins,
    onTick: () => { }
  }
}

const Settings = (): SubMenu => {
  const settings = HtmlDiv({
    top: "5px",
    left: "50%",
    width: "400px",
    height: "300px",
    transform: "translate(-50%)",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    pointerEvents: "auto",
    border: "2px solid #ffffff",
    borderRadius: "10px",
    position: "relative"
  })

  const disableAmbientSound = HtmlButton({
    text: "Disable Ambient Sound",
    style: {
      width: "100px",
      height: "40px",
      position: "relative",
      top: "10px",
      left: "10px",
      pointerEvents: "auto"
    },
    onClick: () => {}
  })

  return {
    div: settings,
    onTick: () => { }
  }
}

const Art = () => HtmlImg("dde-256.jpg", {
  top: "-5px",
  left: "50%",
  width: "200px",
  transform: "translate(-50%)",
  border: "2px solid #eeeeee",
  borderRadius: "10px",
  position: "relative"
})
