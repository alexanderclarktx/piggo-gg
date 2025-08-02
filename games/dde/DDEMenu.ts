import { Entity, HtmlDiv, NPC, Position, HtmlImg, HtmlText, HtmlButton, World } from "@piggo-gg/core"

export const DDEMenu = (world: World): Entity => {

  let init = false
  let polled = -60
  let inLobby = false

  const lobbies = HtmlText({
    text: "LOBBIES",
    style: {
      left: "50%"
    }
  })

  const createLobby = HtmlButton({
    text: "Create Lobby",
    style: {
      left: "25%",
      top: "20%",
      height: "40px"
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

  const img = HtmlImg("dde-256.jpg", {
    right: "10px",
    top: "10px",
    width: "152px",
    border: "2px solid #aaffaa",
    borderRadius: "10px"
  })

  const overlay = HtmlDiv({
    visibility: "hidden",
    left: "50%",
    top: "50%",
    width: "40%",
    height: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    pointerEvents: "auto",
    border: "2px solid #ffffff",
    borderRadius: "10px"
  })

  overlay.appendChild(img)
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
            })
          }
        }
      })
    }
  })
  return menu
}
