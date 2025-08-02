import { Entity, HtmlDiv, NPC, Position } from "@piggo-gg/core"

export const DDEMenu = (): Entity => {

  let open = false
  let appended = false

  const overlay = HtmlDiv({
    text: "Duck Duck Eagle",
    style: {
      visibility: "hidden",
      left: "50%",
      top: "50%",
      width: "60%",
      height: "40%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "rgba(0, 0, 0, 0.95)",
      pointerEvents: "auto",
      border: "2px solid #ffffff",
      borderRadius: "10px"
    }
  })

  const menu = Entity({
    id: "DDEMenu",
    components: {
      position: Position({ x: 0, y: 0, z: 0 }),
      npc: NPC({
        behavior: (_, world) => {
          if (!appended) {
            const parent = world.three?.canvas?.parentElement
            if (parent) {
              parent.appendChild(overlay)
              appended = true
            }
          }

          open = !Boolean(document.pointerLockElement)
          overlay.style.visibility = open ? "visible" : "hidden"
        }
      })
    }
  })
  return menu
}
