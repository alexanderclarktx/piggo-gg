import {
  Entity, HtmlDiv, NPC, Position, HtmlImg, HtmlText,
  HtmlButton, World, entries, keys, HtmlStyleProps,
  styleButton
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
            const parent = world.three?.canvas?.parentElement
            if (parent) {
              parent.appendChild(ddeMenu)
              init = true
            }
          }

          // overall visibility of the menu
          const visible = !Boolean(document.pointerLockElement) && !world.client?.mobile
          ddeMenu.style.visibility = visible ? "visible" : "hidden"

          if (!visible) return

          // menu buttons
          styleButton(lobbiesButton, activeMenu === "lobbies", lobbiesButton.matches(":hover"))
          // lobbiesButton.style.border = activeMenu === "lobbies" ? "2px solid #cccccc" : "2px solid #ffffff"
          // lobbiesButton.style.color = activeMenu === "lobbies" ? "#cccccc" : "#ffffff"
          // lobbiesButton.style.backgroundColor = activeMenu === "lobbies" ? "rgba(0, 0, 0, 0.1)" : "rgba(0, 0, 0, 0.4)"
          // if (lobbiesButton.matches(":hover")) lobbiesButton.style.backgroundColor = "rgba(0, 160, 255, 0.4)"

          skinsButton.style.border = activeMenu === "skins" ? "2px solid #cccccc" : "2px solid #ffffff"
          skinsButton.style.color = activeMenu === "skins" ? "#cccccc" : "#ffffff"
          skinsButton.style.backgroundColor = activeMenu === "skins" ? "rgba(0, 0, 0, 0.1)" : "rgba(0, 0, 0, 0.4)"

          settingsButton.style.border = activeMenu === "settings" ? "2px solid #cccccc" : "2px solid #ffffff"
          settingsButton.style.color = activeMenu === "settings" ? "#cccccc" : "#ffffff"
          settingsButton.style.backgroundColor = activeMenu === "settings" ? "rgba(0, 0, 0, 0.1)" : "rgba(0, 0, 0, 0.4)"

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
  let inLobby: null | string = null

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
      bottom: "10px",
      left: "10px",
      height: "40px",
      width: "186px",
      fontSize: "20px",
    },
    onClick: () => {
      if (inLobby) return

      world.client?.lobbyCreate(({ lobbyId }) => {
        inLobby = lobbyId
        polled = world.tick - 70
      })
      leaveLobby.style.backgroundColor = "rgba(0, 0, 0, 0.4)"
    },
    onHover: () => {
      createLobby.style.backgroundColor = "rgba(0, 160, 255, 0.4)"
    },
    onHoverOut: () => {
      createLobby.style.backgroundColor = inLobby ? "rgba(0, 0, 0, 0)" : "rgba(0, 0, 0, 0.4)"
    }
  })

  const leaveLobby = HtmlButton({
    text: "Leave Lobby",
    style: {
      bottom: "10px", right: "10px", height: "40px", width: "186px", backgroundColor: "rgba(0, 0, 0, 0)"
    },
    onClick: () => {
      if (!inLobby) return

      world.client?.lobbyLeave()

      polled = world.tick - 70
      inLobby = null

      createLobby.style.backgroundColor = "rgba(0, 0, 0, 0.4)"
    },
    onHover: () => {
      leaveLobby.style.backgroundColor = "rgba(0, 160, 255, 0.4)"
    },
    onHoverOut: () => {
      leaveLobby.style.backgroundColor = inLobby ? "rgba(0, 0, 0, 0.4)" : "rgba(0, 0, 0, 0)"
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
      createLobby.style.pointerEvents = inLobby ? "none" : "auto"
      createLobby.style.border = inLobby ? "2px solid #cccccc" : "2px solid #ffffff"
      createLobby.style.color = inLobby ? "#cccccc" : "#ffffff"
      // createLobby.style.backgroundColor = inLobby ? "rgba(0, 0, 0, 0.4)" : "rgba(0, 0, 0, 0.1)"

      leaveLobby.style.pointerEvents = inLobby ? "auto" : "none"
      leaveLobby.style.border = inLobby ? "2px solid #ffffff" : "2px solid #cccccc"
      leaveLobby.style.color = inLobby ? "#ffffff" : "#cccccc"
      // leaveLobby.style.backgroundColor = inLobby ? "rgba(0, 0, 0, 0.1)" : "rgba(0, 0, 0, 0.4)"

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
            inLobby = null
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
