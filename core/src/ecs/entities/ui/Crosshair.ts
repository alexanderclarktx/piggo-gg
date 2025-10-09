import { CraftSettings, Entity, HtmlDiv, NPC, Position } from "@piggo-gg/core"

export const Crosshair = () => {

  let init = false

  const div = HtmlDiv({
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: "5px",
    height: "5px",
    backgroundColor: "rgba(0, 255, 255, 1)",
    border: "0px",
    borderRadius: "50%",
    pointerEvents: "none"
  })

  const crosshair = Entity({
    id: "crosshair",
    components: {
      position: Position(),
      npc: NPC({
        behavior: (_, world) => {
          const settings = world.settings<CraftSettings>()
          if (!world.client || !world.three) return

          const locked = world.client.mobile ? !world.client.mobileMenu : document.pointerLockElement
          const item = world.client?.character()?.components.inventory?.activeItem(world)

          div.style.visibility = (locked && item && settings.showCrosshair) ? "visible" : "hidden"

          if (!init) {
            world.three?.append(div)
            init = true
          }
        }
      })
    }
  })

  return crosshair
}
