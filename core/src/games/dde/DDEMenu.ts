import {
  Entity, HtmlDiv, NPC, Position, HtmlImg,
  HtmlText, HtmlButton, World, entries, keys
} from "@piggo-gg/core"

export const DDEMenu = (world: World): Entity => {

  let init = false
  let polled = -60
  let inLobby: null | string = null
  let activeMenu: "lobbies" | "skins" | "settings" = "lobbies"

  const ddeMenu = HtmlDiv({
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    display: "block",
    pointerEvents: "none"
  })

  const art = Art()

  const sidebar = HtmlDiv({
    position: "relative",
    top: "10px",
  })

  const lobbiesButton = HtmlButton({
    text: "lobbies",
    style: {
      width: "130px",
      position: "relative",
      top: "-10px",
      height: "40px",
      fontSize: "20px",
      pointerEvents: "auto"
    },
    onClick: () => {
      activeMenu = "lobbies"
    },
  })

  const skinsButton = HtmlButton({
    text: "skins",
    style: {
      left: "8px",
      width: "130px",
      position: "relative",
      top: "-10px",
      height: "40px",
      fontSize: "20px",
      pointerEvents: "auto",
    },
    onClick: () => {
      activeMenu = "skins"
    }
  })

  const settingsButton = HtmlButton({
    text: "settings",
    style: {
      left: "15px",
      width: "130px",
      position: "relative",
      top: "-10px",
      height: "40px",
      fontSize: "20px",
      pointerEvents: "auto"
    },
    onClick: () => {
      activeMenu = "settings"
    }
  })

  sidebar.appendChild(lobbiesButton)
  sidebar.appendChild(skinsButton)
  sidebar.appendChild(settingsButton)

  const lobbyList = HtmlDiv({
    width: "380px",
    height: "230px",
    left: "50%",
    top: "10px",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    border: "2px solid #aaaaaa",
    borderRadius: "10px",
    overflow: "scroll",
    scrollbarWidth: "thin",
    transform: "translateX(-50%)",
    display: "flex",
    flexDirection: "column"
  })

  const leaveLobby = HtmlButton({
    text: "Leave Lobby",
    style: {
      bottom: "10px",
      right: "10px",
      height: "40px",
      width: "176px",
      fontSize: "20px",
    },
    onClick: () => {
      if (!inLobby) return

      world.client?.lobbyLeave()

      polled = world.tick - 70
      inLobby = null
    },
    onHover: () => {
      leaveLobby.style.backgroundColor = "rgba(0, 160, 255, 0.5)"
    },
    onHoverOut: () => {
      leaveLobby.style.backgroundColor = "rgba(0, 0, 0, 0.3)"
    }
  })

  const createLobby = HtmlButton({
    text: "Create Lobby",
    style: {
      bottom: "10px",
      left: "10px",
      height: "40px",
      width: "176px",
      fontSize: "20px",
    },
    onClick: () => {
      if (inLobby) return

      world.client?.lobbyCreate(({ lobbyId }) => {
        inLobby = lobbyId
        polled = world.tick - 70
      })
    },
    onHover: () => {
      createLobby.style.backgroundColor = "rgba(0, 160, 255, 0.5)"
    },
    onHoverOut: () => {
      createLobby.style.backgroundColor = "rgba(0, 0, 0, 0.3)"
    }
  })

  const lobbies = HtmlDiv({
    top: "5px",
    left: "50%",
    width: "400px",
    height: "300px",
    transform: "translate(-50%)",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    pointerEvents: "auto",
    border: "2px solid #ffffff",
    borderRadius: "10px",
    position: "relative"
  })

  lobbies.appendChild(lobbyList)
  lobbies.appendChild(createLobby)
  lobbies.appendChild(leaveLobby)

  ddeMenu.appendChild(art)
  ddeMenu.appendChild(sidebar)
  ddeMenu.appendChild(lobbies)

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
          lobbiesButton.style.border = activeMenu === "lobbies" ? "2px solid #aaaaaa" : "2px solid #ffffff"
          lobbiesButton.style.color = activeMenu === "lobbies" ? "#aaaaaa" : "#ffffff"

          skinsButton.style.border = activeMenu === "skins" ? "2px solid #aaaaaa" : "2px solid #ffffff"
          skinsButton.style.color = activeMenu === "skins" ? "#aaaaaa" : "#ffffff"

          settingsButton.style.border = activeMenu === "settings" ? "2px solid #aaaaaa" : "2px solid #ffffff"
          settingsButton.style.color = activeMenu === "settings" ? "#aaaaaa" : "#ffffff"

          createLobby.style.pointerEvents = inLobby ? "none" : "auto"
          createLobby.style.border = inLobby ? "2px solid #aaaaaa" : "2px solid #ffffff"
          createLobby.style.color = inLobby ? "#aaaaaa" : "#ffffff"

          leaveLobby.style.pointerEvents = inLobby ? "auto" : "none"
          leaveLobby.style.border = inLobby ? "2px solid #ffffff" : "2px solid #aaaaaa"
          leaveLobby.style.color = inLobby ? "#ffffff" : "#aaaaaa"

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
                    transform: "translateX(0%)",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    border: meta.id === inLobby ? "2px solid #aaffaa" : "2px solid #aaffff",
                    borderRadius: "8px"
                  }
                })

                const button = HtmlButton({
                  text: "Join",
                  onHover: () => {
                    button.style.backgroundColor = "rgba(0, 160, 255, 0.5)"
                  },
                  onHoverOut: () => {
                    button.style.backgroundColor = "rgba(0, 0, 0, 0.3)"
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
                    border: meta.id === inLobby ? "2px solid #aaaaaa" : "2px solid #ffffff",
                    pointerEvents: meta.id === inLobby ? "none" : "auto",
                    transform: "translateX(0%)",
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
      })
    }
  })
  return menu
}

const Art = () => HtmlImg("dde-256.jpg", {
  top: "-10px",
  left: "50%",
  width: "200px",
  transform: "translate(-50%)",
  border: "2px solid #eeeeee",
  borderRadius: "10px",
  position: "relative"
})
