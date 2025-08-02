import {
  Entity, HtmlDiv, NPC, Position, HtmlImg,
  HtmlText, HtmlButton, World, entries, keys
} from "@piggo-gg/core"

export const DDEMenu = (world: World): Entity => {

  let init = false
  let polled = -60
  let inLobby: null | string = null

  const lobbies = HtmlDiv({
    width: "90%",
    height: "40%",
    left: "50%",
    top: "45%",
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
      top: "88%",
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
      top: "88%",
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

  const art = HtmlImg("dde-256.jpg", {
    left: "50%",
    top: "5%",
    width: "140px",
    transform: "translateX(-50%)",
    border: "2px solid #eeeeee",
    borderRadius: "10px"
  })

  const overlay = HtmlDiv({
    visibility: "hidden",
    left: "50%",
    top: "50%",
    width: "400px",
    height: "400px",
    transform: "translate(-50%, -50%)",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    pointerEvents: "auto",
    border: "2px solid #ffffff",
    borderRadius: "10px"
  })

  overlay.appendChild(art)
  overlay.appendChild(lobbies)
  overlay.appendChild(createLobby)
  overlay.appendChild(leaveLobby)

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
              parent.appendChild(overlay)
              init = true
            }
          }

          const visible = !Boolean(document.pointerLockElement)
          overlay.style.visibility = visible ? "visible" : "hidden"

          if (!visible) return

          createLobby.style.pointerEvents = inLobby ? "none" : "auto"
          leaveLobby.style.pointerEvents = inLobby ? "auto" : "none"

          createLobby.style.border = inLobby ? "2px solid #aaaaaa" : "2px solid #ffffff"
          leaveLobby.style.border = inLobby ? "2px solid #ffffff" : "2px solid #aaaaaa"

          createLobby.style.color = inLobby ? "#aaaaaa" : "#ffffff"
          leaveLobby.style.color = inLobby ? "#ffffff" : "#aaaaaa"

          if (world.tick - 80 > polled) {
            polled = world.tick
            console.log("POLL")
            world.client?.lobbyList((response) => {

              lobbies.innerHTML = ""

              for (const [id, meta] of entries(response.lobbies)) {
                const lobby = HtmlText({
                  text: `${id} (${meta.players})`,
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
                    border: meta.id === inLobby ? "2px solid #aaffaa" : "2px solid #ffaaaa",
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
                  style: {
                    width: "25%",
                    height: "40px",
                    fontSize: "16px",
                    right: "4px",
                    marginTop: "4px",
                    pointerEvents: "auto",
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

                // lobbies.appendChild(lobby)
                // lobbies.appendChild(button)
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
