import { Entity, HtmlDiv, NPC, Position, World } from "@piggo-gg/core"

export const DDEMenu = (world: World): Entity => {

  let open = false

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

  const parent = world.three?.canvas?.parentElement
  if (parent) parent.appendChild(overlay)

  const menu = Entity({
    id: "DDEMenu",
    components: {
      position: Position({ x: 0, y: 0, z: 0 }),
      npc: NPC({
        behavior: () => {

          const pointerLocked = Boolean(document.pointerLockElement)

          open = !pointerLocked

          overlay.style.visibility = open ? "visible" : "hidden"
        }
      })
    }
  })
  return menu
}
