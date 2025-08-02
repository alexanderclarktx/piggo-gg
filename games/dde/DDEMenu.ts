import { Entity, HtmlDiv, NPC, Position, HtmlImg, HtmlText } from "@piggo-gg/core"

export const DDEMenu = (): Entity => {

  let init = false

  const lobbies = HtmlText({
    text: "LOBBIES",
    style: {
      left: "50%"
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

          if (world.tick % 40 === 0) {
            world.client?.lobbyList((response) => {
              console.log(response.lobbies)
            })
          }

          const visible = !Boolean(document.pointerLockElement)
          overlay.style.visibility = visible ? "visible" : "hidden"
        }
      })
    }
  })
  return menu
}
