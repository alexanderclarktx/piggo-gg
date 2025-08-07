import {
  Entity, HtmlDiv, NPC, Position, HtmlImg,
  HtmlText, HtmlButton, World, entries, keys
} from "@piggo-gg/core"

export const DDEMenu = (world: World): Entity => {

  let init = false
  let polled = -60
  let inLobby: null | string = null

  const wrapper = HtmlDiv({
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    display: "block",
    pointerEvents: "none"
  })

  const art = HtmlImg("dde-256.jpg", {
    top: "-10px",
    left: "50%",
    width: "140px",
    transform: "translateX(-50%)",
    border: "2px solid #eeeeee",
    borderRadius: "10px",
    position: "relative"
  })

  const lobbies = HtmlDiv({
    width: "90%",
    height: "70%",
    left: "50%",
    top: "5%",
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
      bottom: "5%",
      height: "40px",
      width: "176px",
      right: "18px",
      fontSize: "20px",
      transform: ""
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
      bottom: "5%",
      height: "40px",
      width: "176px",
      left: "18px",
      fontSize: "20px",
      transform: ""
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

  const servers = HtmlDiv({
    visibility: "hidden",
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

  servers.appendChild(lobbies)
  servers.appendChild(createLobby)
  servers.appendChild(leaveLobby)

  wrapper.appendChild(art)
  wrapper.appendChild(servers)

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
              parent.appendChild(wrapper)
              // parent.appendChild(servers)
              init = true
            }
          }

          const visible = !Boolean(document.pointerLockElement) && !world.client?.mobile
          servers.style.visibility = visible ? "visible" : "hidden"
          art.style.visibility = visible ? "visible" : "hidden"

          if (!visible) return

          createLobby.style.pointerEvents = inLobby ? "none" : "auto"
          leaveLobby.style.pointerEvents = inLobby ? "auto" : "none"

          createLobby.style.border = inLobby ? "2px solid #aaaaaa" : "2px solid #ffffff"
          leaveLobby.style.border = inLobby ? "2px solid #ffffff" : "2px solid #aaaaaa"

          createLobby.style.color = inLobby ? "#aaaaaa" : "#ffffff"
          leaveLobby.style.color = inLobby ? "#ffffff" : "#aaaaaa"

          if (world.tick - 80 > polled) {
            polled = world.tick
            world.client?.lobbyList((response) => {
              lobbies.innerHTML = ""

              for (const [id, meta] of entries(response.lobbies)) {
                const lobby = HtmlText({
                  text: `(${meta.players}) ${meta.creator} ${id}`,
                  style: {
                    width: "70%",
                    height: "36px",
                    left: "4px",
                    marginTop: "4px",
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
                    right: "4px",
                    marginTop: "4px",
                    border: meta.id === inLobby ? "2px solid #aaaaaa" : "2px solid #ffffff",
                    pointerEvents: meta.id === inLobby ? "none" : "auto",
                    transform: "translateX(0%)",
                    position: "relative",
                    float: "right"
                  }
                })

                const wrapper = HtmlDiv({
                  position: "relative"
                })

                wrapper.appendChild(lobby)
                wrapper.appendChild(button)

                lobbies.appendChild(wrapper)
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
