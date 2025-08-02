import { Entity, HtmlDiv, NPC, Position, HtmlImg, HtmlText, HtmlButton, World, entries } from "@piggo-gg/core"

export const DDEMenu = (world: World): Entity => {

  let init = false
  let polled = -60
  let inLobby: null | string = null

  const lobbies = HtmlDiv({
    width: "90%",
    height: "40%",
    left: "5%",
    top: "55%",
    border: "2px solid #aaaaaa",
    borderRadius: "10px",
    overflow: "scroll",
    scrollbarWidth: "thin"
  })

  const createLobby = HtmlButton({
    text: "Create Lobby",
    style: {
      left: "25%",
      top: "20%",
      height: "40px",
      fontSize: "20px",
    },
    onClick: () => {
      if (inLobby) return

      world.client?.lobbyCreate(({ lobbyId }) => {
        inLobby = lobbyId
        polled = world.tick - 75
      })
    },
    onHover: () => {
      createLobby.style.backgroundColor = "rgba(0, 255, 255, 0.6)"
    },
    onHoverOut: () => {
      createLobby.style.backgroundColor = "rgba(0, 0, 0, 0.3)"
    }
  })

  const art = HtmlImg("dde-256.jpg", {
    right: "5%",
    top: "5%",
    width: "152px",
    border: "2px solid #aaffaa",
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

  const menu = Entity({
    id: "DDEMenu",
    components: {
      position: Position({ x: 0, y: 0, z: 0 }),
      npc: NPC({
        behavior: (_, world) => {
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

          createLobby.style.visibility = inLobby ? "hidden" : "visible"

          if (world.tick - 80 > polled) {
            polled = world.tick
            world.client?.lobbyList((response) => {

              lobbies.innerHTML = ""

              for (const [id, meta] of entries(response.lobbies)) {
                const lobbyItem = HtmlText({
                  text: `id:${id} players:${meta.players}`,
                  style: {
                    width: "98%",
                    height: "36px",
                    left: "50%",
                    marginTop: "4px",
                    fontSize: "16px",
                    transform: "translateX(-50%)",
                    position: "relative",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    border: meta.id === inLobby ? "2px solid #aaffaa" : "2px solid #ffaaaa",
                    borderRadius: "8px",
                  }
                })
                lobbies.appendChild(lobbyItem)
              }
            })
          }
        }
      })
    }
  })
  return menu
}
