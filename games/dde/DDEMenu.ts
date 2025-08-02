import { Entity, HtmlDiv, NPC, Position, HtmlImg, HtmlText, HtmlButton, World, entries } from "@piggo-gg/core"

export const DDEMenu = (world: World): Entity => {

  let init = false
  let polled = -60
  let inLobby = false

  const lobbies = HtmlDiv({
    width: "90%",
    height: "40%",
    left: "5%",
    top: "55%",
    border: "2px solid #ffffff",
    borderRadius: "10px",
    overflow: "scroll"
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
      createLobby.style.backgroundColor = "rgba(0, 255, 255, 0.6)"

      if (!inLobby) {
        world.client?.lobbyCreate((response) => {
          inLobby = true
          console.log("Lobby created:", response)
        })
      }
    },
    onRelease: () => {
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
    width: "500px",
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

          if (polled + 80 < world.tick) {
            polled = world.tick
            world.client?.lobbyList((response) => {
              console.log(response.lobbies)

              for (const [id, meta] of entries(response.lobbies)) {
                const lobbyItem = HtmlText({
                  text: `Lobby ${id}: ${meta.players} players`,
                  style: {
                    padding: "5px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    position: "relative",
                    backgroundColor: "rgba(0, 0, 0, 1)",
                    // borderBottom: "1px solid #ffffff"
                  }
                })
                lobbies.appendChild(lobbyItem)
                console.log("Lobby item created:", lobbyItem, lobbies.children.length)
              }
            })
          }
        }
      })
    }
  })
  return menu
}
